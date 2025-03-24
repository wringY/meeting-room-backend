import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Role } from "./role.entity";

export enum LoginType {
    USERNAME_PASSWORD = 0,
    GOOGLE = 1,
    GUTHUB = 2
}

@Entity({
    name: 'users'
})
export class User {
    @PrimaryGeneratedColumn({
        comment: '用户ID'
    })
    id: number

    @Column({
        length: 50,
        comment: '用户名',
        unique: true
    })
    username: string

    @Column({
        length: 50,
        comment: '密码'
    })
    password: string

    @Column({
        length: 50,
        comment: '昵称',
        name: 'nick_name'
    })
    nickName: string

    @Column({
        length: 50,
        comment: '邮箱',
        unique: true
    })
    email: string

    @Column({
        length: 100,
        comment: '头像',
        nullable: true
    })
    head_pic: string

    @Column({
        length: 20,
        comment: '手机号',
        nullable: true
    })
    phone_number: string

    @Column({
        comment: '是否冻结',
        default: false,
        name: 'is_frozen'
    })
    isFrozen: boolean

    @Column({
        comment: '是否是管理员',
        default: false,
        name: 'is_admin'
    })    
    isAdmin: boolean

    @CreateDateColumn({
        comment: '创建时间',
        name: 'create_time'

    })
    create_time: Date

    @UpdateDateColumn({
        comment: '更新时间',
        name: 'update_time'
    })
    update_time: Date

    @JoinTable({
        name: 'user_role' // 多对多的中间表，存储外键
    })
    @ManyToMany(() => Role, (user_role) => user_role.users) // 第二个参数是用来指定外键列, 通过usrer_role.users
    roles: Role[]

    @Column({
        type: 'enum',
        enum: LoginType,
        comment: '登录类型',
        default: LoginType.USERNAME_PASSWORD,
    })
    login_type: LoginType
}
