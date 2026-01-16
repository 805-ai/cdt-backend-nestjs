import { CanActivate, ExecutionContext, forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../../user/services/user.service';
import { ApiErrorSubCode } from '../enums/codes/api-error-subcode.enum';
import { ApiErrorCode } from '../enums/codes/api-error.enum';
import { HttpStatusCode } from '../enums/codes/http-error-code.enum';
import { CustomError } from '../errors/custom.error';
import { UserStatus } from '../../user/enums/role-user.enum';

export class JWTToken {
  token = '';
  header: any = '';
  content: any = '';
  signed = '';
  signature = '';
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authToken = request.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      throw new CustomError('No auth token provided', HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.INVALID_DATA);
    }

    const validateToken = this.validate(authToken);

    try {
      const user = await this.userService.findSession(validateToken.content.uid);

      if (!user) {
        throw new CustomError('Session not found or invalid token', HttpStatusCode.UNAUTHORIZED, ApiErrorCode.USER, ApiErrorSubCode.INVALID_SESSION);
      }

      // if (user.status !== UserStatus.ACTIVE) {
      //   throw new CustomError('Email not verified', HttpStatusCode.FORBIDDEN, ApiErrorCode.USER, ApiErrorSubCode.NOT_VERIFIED);
      // }

      request.user = user;
      request.userId = user.userId;
      return true;
    } catch (err) {
      throw new CustomError(err.message || 'Session not found or invalid token', HttpStatusCode.UNAUTHORIZED, ApiErrorCode.USER, ApiErrorSubCode.INVALID_SESSION, err.stack);
    }
  }

  private getUserService(context: ExecutionContext): UserService {
    const moduleRef = context.switchToHttp().getRequest().app;
    return moduleRef.get(UserService);
  }

  public validate(token: string): JWTToken {
    const jwt = this.parseToken(token);

    if (this.hasExpired(jwt)) {
      throw new CustomError('Token has expired', HttpStatusCode.UNAUTHORIZED, ApiErrorCode.USER, ApiErrorSubCode.TOKEN_EXPIRED);
    }

    return jwt;
  }

  protected hasExpired(jwt: JWTToken): boolean {
    const exp = parseInt(jwt.content.exp);
    return exp * 1000 <= Date.now();
  }

  protected parseToken(token: string): JWTToken {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
      const content = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      const signature = Buffer.from(parts[2], 'base64').toString();
      const signed = parts[0] + '.' + parts[1];

      const jwtToken = new JWTToken();
      jwtToken.token = token;
      jwtToken.header = header;
      jwtToken.content = content;
      jwtToken.signed = signed;
      jwtToken.signature = signature;

      return jwtToken;
    } catch (error) {
      throw new CustomError('Failed to parse JWT token', HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.INVALID_DATA, error.stack);
    }
  }
}
