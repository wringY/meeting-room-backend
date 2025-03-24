import { ApiProperty } from "@nestjs/swagger";
import { UserDetailInfo } from './user-detail.vo'
import { RefeshTokenVo } from './refresh-token.vo'
export class LoginUserVo extends RefeshTokenVo {
    @ApiProperty()
    userInfo: UserDetailInfo;

}

