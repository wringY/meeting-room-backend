import { PickType } from "@nestjs/mapped-types";
import { RegisterUserDto } from "./register-user.dto";

export class UpdatePassWordDto extends PickType(RegisterUserDto, ['username','password', 'email', 'captcha'])  {}

