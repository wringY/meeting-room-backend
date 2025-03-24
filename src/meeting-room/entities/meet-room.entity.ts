import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name: 'meeting_room'
})
export class MeetingRoom {
    @PrimaryGeneratedColumn({
        comment: '会议室ID'
    })
    id: number

    @Column({
        comment: '会议室名称',
        length: 50,
        unique: true
    })
    name: string

    @Column({
        comment: '容纳人数'
    })
    capacity: number

    @Column({
        comment: '会议室位置',
        length: 50
    })
    location: string

    @Column({
        comment: '会议室设备',
        length: 50,
        default: ''
    })
    equipment: string

    @Column({
        comment: '会议室描述',
        length: 100,
        default: ''
    })
    description: string

    @Column({
        comment: '是否被预约',
        default: false
    })
    is_booked: boolean

    @CreateDateColumn()
    create_time: Date

    @UpdateDateColumn()
    update_time: Date
}