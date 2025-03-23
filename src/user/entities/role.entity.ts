import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Permission } from "./permission.entity";

@Entity({
    name: 'roles'
})
export class Role {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        comment: '角色名称',
        length: 20
    })
    name:  string
    @ManyToMany(() => User, (user_roles) => user_roles.roles) // 第二个参数是用来指定外键列
    users: User
    

    @JoinTable({
        name: 'role_permission'
    })
    @ManyToMany(() => Permission, role_permission => role_permission.roles)
    permission: Permission[]
}