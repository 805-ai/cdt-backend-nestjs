import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleGuard } from 'src/common/guards/role.guard';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UserService } from 'src/user/services/user.service';
import { CustomError } from 'src/common/errors/custom.error';
import { HttpStatusCode } from 'src/common/enums/codes/http-error-code.enum';
import { ApiErrorCode } from 'src/common/enums/codes/api-error.enum';
import { ApiErrorSubCode } from 'src/common/enums/codes/api-error-subcode.enum';

jest.mock('src/common/enums/codes/api-error-subcode.enum', () => ({
  ApiErrorSubCode: {
    INVALID_DATA: '1001',
    FORBIDDEN_ACCESS: '1002',
  },
}));

enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: jest.Mocked<Reflector>;
  let authGuard: jest.Mocked<AuthGuard>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const mockAuthGuard = {
      validate: jest.fn(),
    };

    const mockUserService = {
      findSession: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: AuthGuard,
          useValue: mockAuthGuard,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    guard = module.get<RoleGuard>(RoleGuard);
    reflector = module.get(Reflector);
    authGuard = module.get(AuthGuard);
    userService = module.get(UserService);
  });

  it('should allow access when user has required role', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer valid.token' },
        }),
      }),
      getHandler: () => {},
      getClass: () => {},
    } as ExecutionContext;

    authGuard.validate.mockReturnValue({
      token: 'valid.token',
      header: { alg: 'HS256', typ: 'JWT' },
      signed: 'signed',
      signature: 'signature',
      content: {
        uid: 'user123',
        claims: { role: Role.USER },
      },
    } as any);

    userService.findSession.mockResolvedValue({
      userId: 'user123',
      role: Role.USER,
    } as any);

    reflector.getAllAndOverride.mockReturnValue([Role.USER]);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should deny access when user lacks required role', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer valid.token' },
        }),
      }),
      getHandler: () => {},
      getClass: () => {},
    } as ExecutionContext;

    authGuard.validate.mockReturnValue({
      token: 'valid.token',
      header: { alg: 'HS256', typ: 'JWT' },
      signed: 'signed',
      signature: 'signature',
      content: {
        uid: 'user123',
        claims: { role: Role.USER },
      },
    } as any);

    userService.findSession.mockResolvedValue({
      userId: 'user123',
      role: Role.USER,
    } as any);

    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    await expect(guard.canActivate(context)).rejects.toThrow(CustomError);
  });

  it('should throw error when no auth token provided', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
      getHandler: () => {},
      getClass: () => {},
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      new CustomError('No auth token provided', HttpStatusCode.BAD_REQUEST, ApiErrorCode.USER, ApiErrorSubCode.INVALID_DATA),
    );
  });
});
