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
  async me(@Req() req: any) {
    return req.user;
  }

  @Post('/admin-verify')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(CurrentUserInterceptor)
  async adminVerify(
    @Req() req: any,
    @Body() body: { email: string },
  ): Promise<void> {
    if (req.user.status !== Status.ADMIN) {
      throw new ForbiddenException('Only admins can verify users');
    }
    try {
      await this.authService.adminConfirmUser(body.email);
    } catch (e) {
      console.error('Admin verify error:', e);
      throw new BadRequestException(e.message);
    }
  }

  @Get('/users')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(CurrentUserInterceptor)
  async listUsers(@Req() req: any) {
    try {
      const cognitoUsers = await this.authService.listAllUsers();
      // Combine with DB users
      const results = await Promise.all(
        cognitoUsers.map(async (cu) => {
          const email = cu.Attributes.find((a) => a.Name === 'email')?.Value;
          const dbUsers = email ? await this.usersService.find(email) : [];
          return {
            username: cu.Username,
            status: cu.UserStatus, // UNCONFIRMED, CONFIRMED, etc.
            email,
            dbUser: dbUsers[0] || null,
          };
        }),
      );
      return results;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('/signup')
  async createUser(@Body() signUpDto: SignUpDto): Promise<User> {
    // By default, creates a standard user
    try {
      await this.authService.signup(signUpDto);
    } catch (e) {
      console.error('Signup error:', e);
      throw new BadRequestException(e.message);
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
    } catch (e) {
      console.error('Verify error:', e);
      throw new BadRequestException(e.message);
    }
  }

  @Post('/signin')
  async signin(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    try {
      return await this.authService.signin(signInDto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('/refresh')
  refresh(@Body() refreshDto: RefreshTokenDto): Promise<SignInResponseDto> {
    return this.authService.refreshToken(refreshDto);
  }

  @Post('/forgotPassword')
  forgotPassword(@Body() body: ForgotPasswordDto): Promise<void> {
    return this.authService.forgotPassword(body.email);
  }

  @Post('/confirmPassword')
  confirmPassword(@Body() body: ConfirmPasswordDto): Promise<void> {
    return this.authService.confirmForgotPassword(body);
  }

  @Post('/delete')
  async delete(@Body() body: DeleteUserDto): Promise<void> {
    const user = await this.usersService.findOne(body.userId);

    try {
      await this.authService.deleteUser(user.email);
    } catch (e) {
      console.error('Delete error:', e);
      throw new BadRequestException(e.message);
    }

    this.usersService.remove(user.id);
  }
}
