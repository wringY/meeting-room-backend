import { ApiProperty } from "@nestjs/swagger";

class UserInfo {
    @ApiProperty()
    id: number;

    @ApiProperty({
        example: 'zhangsan'
    })
    username: string;

    @ApiProperty({
        example: 'zhangsan'
    })
    nickName: string;

    @ApiProperty({
        example: 'zhangsan@163.com'
    })
    email: string;

    @ApiProperty({
        example: 'xxx.png'
    })
    headPic: string;

    @ApiProperty({
        example: '13212345678'
    })
    phoneNumber: string;

    @ApiProperty()
    isFrozen: boolean;

    @ApiProperty()
    isAdmin: boolean;

    @ApiProperty()
    createTime: string;

    @ApiProperty({
        example: ['管理员']
    })
    roles: string[];

    @ApiProperty({
        example: ['query_aaa']
    })
    permissions: string[]
}
export class LoginUserVo {
    @ApiProperty()
    userInfo: UserInfo;

    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;
}

