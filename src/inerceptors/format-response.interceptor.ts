import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Response } from 'express';
import { Observable, map } from 'rxjs';

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const respone: Response = context.switchToHttp().getResponse()
    return next.handle().pipe(
      map(
        (data) => {
          return {
            code: respone.statusCode,
            message: 'success',
            data
          }
        }
      ))
  }
}
