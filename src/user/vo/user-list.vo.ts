import { ApiProperty } from "@nestjs/swagger"
import { UserInfoVo } from './user-detail.vo'

export class UserListVo {
    
    @ApiProperty()
    list: UserInfoVo[]

    @ApiProperty()
    total: number

    @ApiProperty()
    pageNo: number

    @ApiProperty()
    pageSize: number
}