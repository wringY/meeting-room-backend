import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { UnloginException } from 'src/filters/unlogin.filter';
import { Permission } from 'src/user/entities/permission.entity';

interface JwtUserData {
    userId: string
    username: string
    roles: string[]
    email: string
    permissions: Permission[]
}

declare module 'express' {
    interface Request {
        user: JwtUserData
    }
}

@Injectable()
export class LoginGuard implements CanActivate {

    @Inject(JwtService)
    private readonly jwtService: JwtService;

    @Inject(Reflector)
    private readonly reflector: Reflector


    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {

        console.log('LoginGuard')
        const request: Request = context.switchToHttp().getRequest()

        const requireLogin = this.reflector.getAllAndOverride('require-login', [
            context.getHandler(),
            context.getClass()
        ])

        if (!requireLogin) {
            return true
        }

        const authorization = request.headers.authorization

        if (!authorization) {
            throw new UnloginException('用户未登录')
        }

        try {
            const token = authorization.split(' ')[1]
            const userInfo = this.jwtService.verify<JwtUserData>(token)

            request.user = {
                userId: userInfo.userId,
                username: userInfo.username,
                email: userInfo.email,
                roles: userInfo.roles,
                permissions: userInfo.permissions
            }

            return true
        } catch (error) {
            throw new UnauthorizedException('token 失效，请重新登录')
        }
    }
}
