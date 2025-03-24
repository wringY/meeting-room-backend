import { Inject } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { LoginUserDto } from "src/user/dto/login-user.dto";
import { UserService } from "src/user/user.service";

export class LocalStrategy extends PassportStrategy(Strategy) {
    @Inject(UserService)
    private userService: UserService
    async validate(username: string, password: string) {
        const dto = new LoginUserDto()
        dto.username = username
        dto.password = password
        
        const user = await this.userService.login(dto, false)
        return user
    }
}