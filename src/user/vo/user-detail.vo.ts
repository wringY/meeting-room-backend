import { ApiProperty } from "@nestjs/swagger";
import { User } from "../entities/user.entity";
export class UserInfoVo {
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
    create_time: Date;
}

// 用户信息 包含角色和权限
export class UserDetailInfo extends UserInfoVo {

    @ApiProperty({
        example: ['管理员']
    })
    roles: string[];

    @ApiProperty({
        example: ['query_aaa']
    })
    permissions: string[]
}

export function createUserDetailInfo(user: User) {
    const userInfo = new UserDetailInfo()
    userInfo.id = user.id
    userInfo.username = user.username
    userInfo.nickName = user.nickName
    userInfo.email = user.email
    userInfo.phoneNumber = user.phone_number
    userInfo.headPic = user.head_pic
    userInfo.isFrozen = user.isFrozen
    userInfo.isAdmin = user.isAdmin
    userInfo.roles = user.roles.map(item => item.name),
        userInfo.permissions = user.roles.reduce((arr: any, item) => {
            item.permission.forEach(permission => {
                if (arr.indexOf(permission) === -1) {
                    arr.push(permission);
                }
            })
            return arr;
        }, [])

    return userInfo
}