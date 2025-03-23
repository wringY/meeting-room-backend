import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";
export const RequireLogin = () => SetMetadata('require-login', true)

export const RequirePermission = (...permission: string[]) => SetMetadata('require-permission', permission)

export const UserInfo = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest()

        if (!request) return null

        return data ? request.user[data] : request.user
    }
)