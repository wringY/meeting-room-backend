import { PickType } from "@nestjs/mapped-types";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { RegisterUserDto } from "./register-user.dto";

export class UpdateUserDto extends PickType(RegisterUserDto, ['email', 'captcha']) {

    @ApiPropertyOptional()
    headPic: string;

    @ApiPropertyOptional()
    nickName: string;
    
}
