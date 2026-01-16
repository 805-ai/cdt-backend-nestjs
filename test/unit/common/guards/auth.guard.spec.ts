import { ExecutionContext } from '@nestjs/common';
import { ApiErrorSubCode } from 'src/common/enums/codes/api-error-subcode.enum';
import { ApiErrorCode } from 'src/common/enums/codes/api-error.enum';
import { HttpStatusCode } from 'src/common/enums/codes/http-error-code.enum';
import { CustomError } from 'src/common/errors/custom.error';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UserService } from 'src/user/services/user.service';
import { UserStatus } from 'src/user/enums/role-user.enum';

jest.mock('src/common/enums/codes/api-error-subcode.enum', () => ({
  ApiErrorSubCode: {
    INVALID_DATA: '1001',
    TOKEN_EXPIRED: '1003',
    INVALID_SESSION: '1004',
    NOT_VERIFIED: '1005',
  },
}));

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let context: ExecutionContext;
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(() => {
    mockUserService = {
      findSession: jest.fn(),
    } as any;

    guard = new AuthGuard(mockUserService);
    context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer valid.token' } }),
      }),
    } as any;
  });

  it('should return true for valid token', async () => {
    jest.spyOn(guard as any, 'validate').mockReturnValue({
      token: 'valid.token',
      header: { alg: 'HS256', typ: 'JWT' },
      signed: 'signed-part',
      signature: 'signature-part',
      content: { exp: Math.floor(Date.now() / 1000) + 3600, uid: 'user123' },
    });

    mockUserService.findSession.mockResolvedValue({
      userId: 'user123',
      status: UserStatus.ACTIVE,
    } as any);

    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should throw CustomError for no token', async () => {
    context.switchToHttp().getRequest().headers.authorization = undefined;
    await expect(guard.canActivate(context)).rejects.toThrow(
      new CustomError('No auth token provided', HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.INVALID_DATA),
    );
  });

  it('should throw CustomError for invalid token', async () => {
    jest.spyOn(guard as any, 'validate').mockImplementation(() => {
      throw new CustomError('Failed to parse JWT token', HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.INVALID_DATA);
    });
    await expect(guard.canActivate(context)).rejects.toThrow(
      new CustomError('Failed to parse JWT token', HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.INVALID_DATA),
    );
  });

  it('should throw CustomError for expired token', async () => {
    jest.spyOn(guard as any, 'validate').mockImplementation(() => {
      throw new CustomError('Token has expired', HttpStatusCode.UNAUTHORIZED, ApiErrorCode.USER, ApiErrorSubCode.TOKEN_EXPIRED);
    });
    await expect(guard.canActivate(context)).rejects.toThrow(new CustomError('Token has expired', HttpStatusCode.UNAUTHORIZED, ApiErrorCode.USER, ApiErrorSubCode.TOKEN_EXPIRED));
  });
});
