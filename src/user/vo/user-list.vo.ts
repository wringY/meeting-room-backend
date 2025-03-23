import { ApiProperty } from "@nestjs/swagger"
import { User } from "../entities/user.entity"

export class UserListVo {
    
    @ApiProperty()
    list: User[]

    @ApiProperty()
    total: number

    @ApiProperty()
    pageNo: number

    @ApiProperty()
    pageSize: number
}