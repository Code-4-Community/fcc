import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { Status } from '../users/types';

import { SignInDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { VerifyUserDto } from './dtos/verify-user.dto';
import { DeleteUserDto } from './dtos/delete-user.dto';
import { User } from '../users/user.entity';
import { SignInResponseDto } from './dtos/sign-in-response.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { ConfirmPasswordDto } from './dtos/confirm-password.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ApiTags } from '@nestjs/swagger';

interface AuthenticatedUser {
  id?: number;
  idUser?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  displayName?: string;
  username?: string;
  status?: string;
}

interface AuthenticatedRequest {
  user?: AuthenticatedUser;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Get('/me')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(CurrentUserInterceptor)
  async me(@Req() req: AuthenticatedRequest) {
    const user = req.user ?? {};

    return {
      ...user,
      displayName: this.resolveDisplayName(user),
      username: this.resolveUsername(user),
    };
  }

  private resolveDisplayName(user: AuthenticatedUser): string {
    const fullName = [user.firstName, user.lastName]
      .filter((part) => typeof part === 'string' && part.trim().length > 0)
      .join(' ')
      .trim();

    return (
      fullName ||
      user.name ||
      user.displayName ||
      user.username ||
      user.email ||
      user.idUser ||
      'User'
    );
  }

  private resolveUsername(user: AuthenticatedUser): string {
    return (
      user.username ||
      user.email ||
      user.idUser ||
      this.resolveDisplayName(user)
    );
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
  }

  @Post('/admin-verify')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(CurrentUserInterceptor)
  async adminVerify(
    @Req() req: AuthenticatedRequest,
    @Body() body: { email: string },
  ): Promise<void> {
    if (req.user?.status !== Status.ADMIN) {
      throw new ForbiddenException('Only admins can verify users');
    }
    try {
      await this.authService.adminConfirmUser(body.email);
    } catch (error: unknown) {
      console.error('Admin verify error:', error);
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  @Post('/admin-deny')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(CurrentUserInterceptor)
  async adminDeny(
    @Req() req: AuthenticatedRequest,
    @Body() body: { email: string },
  ): Promise<void> {
    if (req.user?.status !== Status.ADMIN) {
      throw new ForbiddenException('Only admins can deny users');
    }
    try {
      await this.authService.deleteUser(body.email);
    } catch (error: unknown) {
      console.error('Admin deny error:', error);
      throw new BadRequestException(this.getErrorMessage(error));
    }
    const dbUsers = await this.usersService.find(body.email);
    if (dbUsers.length > 0) {
      await this.usersService.remove(dbUsers[0].id);
    }
  }

  @Get('/users')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(CurrentUserInterceptor)
  async listUsers() {
    try {
      const cognitoUsers = await this.authService.listAllUsers();
      // Combine with DB users
      const results = await Promise.all(
        cognitoUsers.map(async (cu) => {
          const attributes = cu.Attributes ?? [];
          const email = attributes.find((a) => a.Name === 'email')?.Value;
          const name = attributes.find((a) => a.Name === 'name')?.Value;
          let dbUser = null;

          if (email) {
            const dbUsers = await this.usersService.find(email);
            if (dbUsers.length > 0) {
              dbUser = dbUsers[0];
            } else {
              // Selfhealing: Create DB record if it doesn't exist but cognito user exists
              const [firstName = '', lastName = ''] = (name || '').split(' ');
              try {
                dbUser = await this.usersService.create(
                  email,
                  firstName,
                  lastName,
                );
              } catch (err) {
                console.error(`Failed to auto-populate user ${email}:`, err);
              }
            }
          }

          return {
            username: cu.Username,
            name,
            status: cu.UserStatus, // UNCONFIRMED, CONFIRMED, etc.
            email,
            dbUser: dbUser,
          };
        }),
      );
      return results;
    } catch (error: unknown) {
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  @Post('/signup')
  async createUser(@Body() signUpDto: SignUpDto): Promise<User> {
    console.log(`Signup request received for: ${signUpDto.email}`);
    // By default, creates a standard user
    try {
      await this.authService.signup(signUpDto);
    } catch (error: unknown) {
      console.error('Signup error:', error);
      throw new BadRequestException(this.getErrorMessage(error));
    }

    const user = await this.usersService.create(
      signUpDto.email,
      signUpDto.firstName,
      signUpDto.lastName,
    );

    return user;
  }

  // TODO deprecated if verification code is replaced by link
  @Post('/verify')
  verifyUser(@Body() body: VerifyUserDto): void {
    try {
      this.authService.verifyUser(body.email, body.verificationCode);
    } catch (error: unknown) {
      console.error('Verify error:', error);
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  @Post('/signin')
  async signin(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    console.log(`Signin request received for: ${signInDto.email}`);
    try {
      return await this.authService.signin(signInDto);
    } catch (error: unknown) {
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  @Post('/refresh')
  refresh(@Body() refreshDto: RefreshTokenDto): Promise<SignInResponseDto> {
    return this.authService.refreshToken(refreshDto);
  }

  @Post('/forgotPassword')
  async forgotPassword(@Body() body: ForgotPasswordDto): Promise<void> {
    const registeredUsers = await this.usersService.find(body.email);

    if (!registeredUsers.length) {
      throw new BadRequestException('Account is not registered.');
    }

    try {
      await this.authService.forgotPassword(body.email);
    } catch (e) {
      console.error('Forgot password error:', e);
      throw new BadRequestException(e.message);
    }
  }

  @Post('/confirmPassword')
  async confirmPassword(@Body() body: ConfirmPasswordDto): Promise<void> {
    try {
      await this.authService.confirmForgotPassword(body);
    } catch (e) {
      console.error('Confirm password error:', e);
      // Map Cognito errors to user-friendly messages
      if (e instanceof Error) {
        const errName = (e as any).name || '';
        if (
          errName === 'InvalidVerificationCodeException' ||
          errName === 'CodeMismatchException'
        ) {
          throw new BadRequestException('Confirmation code is incorrect');
        }
        if (errName === 'UserNotFoundException') {
          throw new BadRequestException('User not found');
        }
        if (errName === 'ExpiredCodeException') {
          throw new BadRequestException('Confirmation code has expired');
        }
      }
      throw new BadRequestException(e.message || 'Failed to reset password');
    }
  }

  @Post('/delete')
  async delete(@Body() body: DeleteUserDto): Promise<void> {
    const user = await this.usersService.findOne(body.userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    try {
      await this.authService.deleteUser(user.email);
    } catch (error: unknown) {
      console.error('Delete error:', error);
      throw new BadRequestException(this.getErrorMessage(error));
    }

    await this.usersService.remove(user.id);
  }
}
