import { CanActivate, ExecutionContext, Inject, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { Observable } from "rxjs";

export class PermissionGuard implements CanActivate {

    @Inject(Reflector)
    private readonly reflector: Reflector
    
    
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request: Request = context.switchToHttp().getRequest()

        if (!request.user) {
            return true
        }

        const requirePermission = this.reflector.getAllAndOverride('require-permission', [
            context.getHandler(),
            context.getClass()
        ])

        if (!requirePermission) {
            return true
        }

        const permission = request.user.permissions

        for (let i = 0; i < requirePermission.length; i++) {
            const curPermission = requirePermission[i]
            const found = permission.find(item => item.code === curPermission)

            if (!found) {
                throw new UnauthorizedException('您没有访问该接口的权限')
            }
            
        }

        return true
    }
}