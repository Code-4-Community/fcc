import { Injectable } from '@nestjs/common';
import {
  AdminConfirmSignUpCommand,
  AdminDeleteUserCommand,
  AdminInitiateAuthCommand,
  AttributeType,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ListUsersCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';

import CognitoAuthConfig from './aws-exports';
import { SignUpDto } from './dtos/sign-up.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { SignInResponseDto } from './dtos/sign-in-response.dto';
import { createHmac } from 'crypto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { Status } from '../users/types';
import { ConfirmPasswordDto } from './dtos/confirm-password.dto';

@Injectable()
export class AuthService {
  private readonly providerClient: CognitoIdentityProviderClient;
  private readonly clientSecret: string;

  constructor() {
    console.log(
      `Initializing AuthService with UserPoolId: ${CognitoAuthConfig.userPoolId}, Region: ${CognitoAuthConfig.region}`,
    );
    const accessKeyId = process.env.NX_AWS_ACCESS_KEY;
    const secretAccessKey = process.env.NX_AWS_SECRET_ACCESS_KEY;

    this.providerClient = new CognitoIdentityProviderClient({
      region: CognitoAuthConfig.region,
      ...(accessKeyId && secretAccessKey
        ? {
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
          }
        : {}),
    });

    this.clientSecret = process.env.COGNITO_CLIENT_SECRET ?? '';
  }

  // Computes secret hash to authenticate this backend to Cognito
  // Hash key is the Cognito client secret, message is username + client ID
  // Username value depends on the command
  // (see https://docs.aws.amazon.com/cognito/latest/developerguide/signing-up-users-in-your-app.html#cognito-user-pools-computing-secret-hash)
  calculateHash(username: string): string | undefined {
    if (!this.clientSecret) {
      return undefined;
    }
    const hmac = createHmac('sha256', this.clientSecret);
    hmac.update(username + CognitoAuthConfig.clientId);
    return hmac.digest('base64');
  }

  async getUser(userSub: string): Promise<AttributeType[]> {
    const listUsersCommand = new ListUsersCommand({
      UserPoolId: CognitoAuthConfig.userPoolId,
      Filter: `sub = "${userSub}"`,
    });

    // TODO need error handling
    const { Users } = await this.providerClient.send(listUsersCommand);
    return Users?.[0]?.Attributes || [];
  }

  async listAllUsers() {
    const listUsersCommand = new ListUsersCommand({
      UserPoolId: CognitoAuthConfig.userPoolId,
    });

    const { Users } = await this.providerClient.send(listUsersCommand);
    return Users || [];
  }

  async adminConfirmUser(email: string): Promise<void> {
    const username = await this.resolveCognitoUsernameByEmail(email);

    const confirmCommand = new AdminConfirmSignUpCommand({
      UserPoolId: CognitoAuthConfig.userPoolId,
      Username: username,
    });

    await this.providerClient.send(confirmCommand);
  }

  async signup(
    { firstName, lastName, email, password }: SignUpDto,
    status: Status = Status.STANDARD,
  ): Promise<boolean> {
    console.log(`Attempting signup for: ${email} with status: ${status}`);
    const username = this.buildCognitoUsername(email);
    const signUpCommand = new SignUpCommand({
      ClientId: CognitoAuthConfig.clientId,
      SecretHash: this.calculateHash(username),
      Username: username,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'name',
          Value: `${firstName} ${lastName}`.trim(),
        },
      ],
      Password: password,
      // Commented out as it might cause InvalidParameterException if not in User Pool
      // {
      //   Name: 'custom:role',
      //   Value: status,
      // },
    });

    try {
      const response = await this.providerClient.send(signUpCommand);
      return response.UserConfirmed ?? false;
    } catch (err) {
      console.error('Cognito signup error:', err);
      throw err;
    }
  }

  async verifyUser(email: string, verificationCode: string): Promise<void> {
    const username = await this.resolveCognitoUsernameByEmail(email);

    const confirmCommand = new ConfirmSignUpCommand({
      ClientId: CognitoAuthConfig.clientId,
      SecretHash: this.calculateHash(username),
      Username: username,
      ConfirmationCode: verificationCode,
    });

    await this.providerClient.send(confirmCommand);
  }

  async signin({ email, password }: SignInDto): Promise<SignInResponseDto> {
    const username = await this.resolveCognitoUsernameByEmail(email);

    const authParameters: Record<string, string> = {
      USERNAME: username,
      PASSWORD: password,
    };

    const secretHash = this.calculateHash(username);
    if (secretHash) {
      authParameters.SECRET_HASH = secretHash;
    }

    const signInCommand = new AdminInitiateAuthCommand({
      AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
      ClientId: CognitoAuthConfig.clientId,
      UserPoolId: CognitoAuthConfig.userPoolId,
      AuthParameters: authParameters,
    });

    try {
      console.log(`Calling Cognito AdminInitiateAuth for ${username}`);
      const response = await this.providerClient.send(signInCommand);
      console.log(`Cognito response received for ${username}`);
      const authResult = response.AuthenticationResult;

      if (
        !authResult?.AccessToken ||
        !authResult.RefreshToken ||
        !authResult.IdToken
      ) {
        throw new Error('Cognito sign in did not return the expected tokens.');
      }

      return {
        accessToken: authResult.AccessToken,
        refreshToken: authResult.RefreshToken,
        idToken: authResult.IdToken,
      };
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'name' in err &&
        err.name === 'UserNotConfirmedException'
      ) {
        throw new Error(
          'Your account is not confirmed yet. Please ask an admin to confirm your registration.',
        );
      }
      console.error('Signin error:', err);
      throw err;
    }
  }

  // Refresh token hash uses a user's sub (unique ID), not their username (typically their email)
  async refreshToken({
    refreshToken,
    userSub,
  }: RefreshTokenDto): Promise<SignInResponseDto> {
    const authParameters: Record<string, string> = {
      REFRESH_TOKEN: refreshToken,
    };

    const secretHash = this.calculateHash(userSub);
    if (secretHash) {
      authParameters.SECRET_HASH = secretHash;
    }

    const refreshCommand = new AdminInitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: CognitoAuthConfig.clientId,
      UserPoolId: CognitoAuthConfig.userPoolId,
      AuthParameters: authParameters,
    });

    const response = await this.providerClient.send(refreshCommand);
    const authResult = response.AuthenticationResult;

    if (!authResult?.AccessToken || !authResult.IdToken) {
      throw new Error('Cognito refresh did not return the expected tokens.');
    }

    return {
      accessToken: authResult.AccessToken,
      refreshToken: refreshToken,
      idToken: authResult.IdToken,
    };
  }

  async forgotPassword(email: string) {
    const username = await this.resolveCognitoUsernameByEmail(email);

    const forgotCommand = new ForgotPasswordCommand({
      ClientId: CognitoAuthConfig.clientId,
      Username: username,
      SecretHash: this.calculateHash(username),
    });

    await this.providerClient.send(forgotCommand);
  }

  async confirmForgotPassword({
    email,
    confirmationCode,
    newPassword,
  }: ConfirmPasswordDto) {
    const username = await this.resolveCognitoUsernameByEmail(email);

    const confirmComamnd = new ConfirmForgotPasswordCommand({
      ClientId: CognitoAuthConfig.clientId,
      SecretHash: this.calculateHash(username),
      Username: username,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
    });

    await this.providerClient.send(confirmComamnd);
  }

  async deleteUser(email: string): Promise<void> {
    const username = await this.resolveCognitoUsernameByEmail(email);

    const adminDeleteUserCommand = new AdminDeleteUserCommand({
      Username: username,
      UserPoolId: CognitoAuthConfig.userPoolId,
    });

    await this.providerClient.send(adminDeleteUserCommand);
  }

  private buildCognitoUsername(email: string): string {
    const localPart = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '');
    const prefix = localPart.length > 0 ? localPart : 'user';

    return `fcc-${prefix}-${Date.now().toString(36)}`;
  }

  private async resolveCognitoUsernameByEmail(email: string): Promise<string> {
    const usersCommand = new ListUsersCommand({
      UserPoolId: CognitoAuthConfig.userPoolId,
      Filter: `email = "${email}"`,
      Limit: 1,
    });

    const { Users } = await this.providerClient.send(usersCommand);
    return Users?.[0]?.Username ?? email;
  }
}
