import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiErrorSubCode } from '../enums/codes/api-error-subcode.enum';
import { ApiErrorCode } from '../enums/codes/api-error.enum';
import { HttpStatusCode } from '../enums/codes/http-error-code.enum';
import { CustomError } from '../errors/custom.error';
import { AuthGuard } from './auth.guard';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector, private authGuard: AuthGuard, private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authToken = request.headers.authorization?.replace('Bearer ', '');

    if (!authToken) {
      throw new CustomError('No auth token provided', HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.INVALID_DATA);
    }

    const validateToken = this.authGuard.validate(authToken);
    request.authToken = authToken;

    const allowedRoles = this.reflector.getAllAndOverride<string[]>('roles', [context.getHandler(), context.getClass()]);
    const user = await this.userService.findSession(validateToken.content.uid);
    const userRole = validateToken.content.claims?.role;

    if (!allowedRoles || !allowedRoles.includes(userRole)) {
      throw new CustomError(
        `Access denied. Your role is "${user.role}", but one of the following roles is required: ${allowedRoles.join(', ')}.`,
        HttpStatusCode.FORBIDDEN,
        ApiErrorCode.USER,
        ApiErrorSubCode.FORBIDDEN_ACCESS,
      );
    }
    return true;
  }
}
