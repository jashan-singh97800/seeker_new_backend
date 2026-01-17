import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => ({
                success: true,
                statusCode: context.switchToHttp().getResponse().statusCode,
                message: data?.message || 'Request successful',
                data: data?.data || data,
            })),
            catchError((err) => {
                const status =
                    err instanceof HttpException
                        ? err.getStatus()
                        : HttpStatus.INTERNAL_SERVER_ERROR;

                const response = err instanceof HttpException ? err.getResponse() : err;
                const message = (response as any).message || err.message || 'Internal server error';

                return throwError(() => new HttpException({
                    success: false,
                    statusCode: status,
                    message: Array.isArray(message) ? message[0] : message, // Handle class-validator array of messages
                    error: (response as any).error || err.name,
                }, status));
            }),
        );
    }
}
