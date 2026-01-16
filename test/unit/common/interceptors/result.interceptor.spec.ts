import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { ApiErrorSubCode } from 'src/common/enums/codes/api-error-subcode.enum';
import { ApiErrorCode } from 'src/common/enums/codes/api-error.enum';
import { HttpStatusCode } from 'src/common/enums/codes/http-error-code.enum';
import { CustomError } from 'src/common/errors/custom.error';
import { ResultInterceptor } from 'src/common/interceptors/result.interceptor';

describe('ResultInterceptor', () => {
  let interceptor: ResultInterceptor;
  let context: ExecutionContext;
  let handler: CallHandler;

  beforeEach(() => {
    interceptor = new ResultInterceptor();
    context = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/test' }),
        getResponse: () => ({ status: jest.fn() }),
      }),
    } as any;
  });

  it('should format successful response', (done) => {
    handler = { handle: () => of({ data: 'test' }) };
    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toEqual({
        result: { data: 'test' },
        errors: null,
        status: HttpStatusCode.OK,
        errorDetails: null,
        stack: null,
      });
      done();
    });
  });

  it('should handle CustomError and format error response', (done) => {
    const error = new CustomError('Test error', HttpStatusCode.BAD_REQUEST, ApiErrorCode.VALIDATION, ApiErrorSubCode.INVALID_DATA);
    handler = { handle: () => throwError(() => error) };
    interceptor.intercept(context, handler).subscribe({
      error: (err) => {
        expect(err.response).toEqual({
          result: null,
          errors: ['Test error'],
          status: HttpStatusCode.BAD_REQUEST,
          errorDetails: { apiErrorCode: 'VALIDATION', apiErrorSubCode: '1001' },
          stack: expect.any(String),
        });
        done();
      },
    });
  });
});
