import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from './user.entity';
import { CurrentUserInterceptor } from '../interceptors/current-user.interceptor';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateUserStatusDto } from './dtos/update-user-status.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Status } from './types';

interface AuthenticatedRequest extends Request {
  user: User;
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(CurrentUserInterceptor)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/:userId')
  async getUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<User | null> {
    return this.usersService.findOne(userId);
  }

  @Patch('/:userId')
  async updateUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user?.id !== userId && req.user?.status !== Status.ADMIN) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.usersService.update(userId, body);
  }

  @Patch('/:id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user?.status !== Status.ADMIN) {
      throw new ForbiddenException('Only admins can update user status');
    }
    return this.usersService.update(id, { status: body.status });
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id));
  }
}
