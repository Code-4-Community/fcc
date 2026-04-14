import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const cognitoUserAttributes = await this.authService.getUser(
      request.user.idUser,
    );
    const userEmail = cognitoUserAttributes.find(
      (attribute) => attribute.Name === 'email',
    )?.Value;

    if (!userEmail) {
      return handler.handle();
    }

    const users = await this.usersService.find(userEmail);

    if (users.length > 0) {
      const user = users[0];

      request.user = {
        ...request.user,
        ...user,
      };
    } else {
      // Selfhealing: Create DB record if it doesn't exist but cognito user exists
      const nameAttribute = cognitoUserAttributes.find(
        (attribute) => attribute.Name === 'name',
      )?.Value;
      const [firstName = '', lastName = ''] = (nameAttribute || '').split(' ');

      try {
        const newUser = await this.usersService.create(
          userEmail,
          firstName,
          lastName,
        );
        request.user = {
          ...request.user,
          ...newUser,
        };
      } catch (error) {
        console.error('Failed to self-heal user in DB:', error);
      }
    }

    return handler.handle();
  }
}
