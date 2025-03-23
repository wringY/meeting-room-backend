import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.entity";

@Entity()
export class Permission {
    
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        comment: '权限代码',
        length: 20
    })
    code: string

    @Column({
        comment: '权限描述',
        length: 100
    })
    description: string

    @ManyToMany(() => Role, role_permission => role_permission.permission)
    roles: Role[]
}