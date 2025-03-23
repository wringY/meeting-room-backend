import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import * as requestIp from 'request-ip'

@Injectable()
export class InvokeRecordInterceptor implements NestInterceptor {
  private logger = new Logger(InvokeRecordInterceptor.name)
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const request: Request = context.switchToHttp().getRequest()
    const respone: Response = context.switchToHttp().getResponse()

    const userAgent = request.headers['user-agent']
    const { ip, method, path } = request

    const clientIp = requestIp.getClientIp(request) || ip

    this.logger.debug(`${method} ${path} ${clientIp} ${userAgent}:
        ${context.getClass().name}
        ${context.getHandler().name}
        invoked...
      `)

      this.logger.debug(`user: ${request.user?.userId}, ${request.user?.username}`)

      const now = Date.now()
      
    return next.handle().pipe(
      tap((res) => {
        this.logger.debug(
          `${method} ${path} ${clientIp} ${userAgent}: ${respone.statusCode}: ${Date.now() - now}ms`
        )
        this.logger.debug(`Response: ${JSON.stringify(res)}`)
      })
    )
  }
}
