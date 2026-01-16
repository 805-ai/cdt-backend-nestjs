import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpStatusCode } from '../enums/codes/http-error-code.enum';
import { CustomError } from '../errors/custom.error';
import { ENVIRONMENT } from '../config/secrets';

@Injectable()
export class ResultInterceptor implements NestInterceptor {
  intercept<T>(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{
    result: T | null;
    errors: string[] | null;
    status: number;
    errorDetails: { apiErrorCode: string; apiErrorSubCode: string } | null;
    stack: string | null;
  }> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const isCreateUser = request.method === 'POST' && request.url.includes('create');

    return next.handle().pipe(
      map((data: T) => {
        const status = isCreateUser ? HttpStatusCode.CREATED : HttpStatusCode.OK;
        response.status(status);
        return {
          result: data,
          errors: null,
          status: status,
          errorDetails: null,
          stack: null,
        };
      }),
      catchError((error: any) => {
        if (error instanceof CustomError) {
          const errorResponse = error.getResponse() as {
            errors: string[];
            status: number;
            errorDetails: { apiErrorCode: string; apiErrorSubCode: string };
          };
          const status = error.getStatus() || HttpStatusCode.INTERNAL_SERVER_ERROR;
          response.status(status);
          return throwError(
            () =>
              new HttpException(
                {
                  result: null,
                  errors: errorResponse.errors || [error.message],
                  status: status,
                  errorDetails: errorResponse.errorDetails || {
                    apiErrorCode: 'UNKNOWN',
                    apiErrorSubCode: 'UNKNOWN_ERROR',
                  },
                  stack: ENVIRONMENT !== 'production' ? error.stack : null,
                },
                status,
              ),
          );
        }
        return throwError(() => error);
      }),
    );
  }
}
