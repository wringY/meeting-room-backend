import { MeetingRoom } from "../../meeting-room/entities/meet-room.entity"
import { User } from "../../user/entities/user.entity"
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

export enum BookingStatus {
    PENDING = '申请中',
    APPROVED = '审批通过',
    REJECTED = '审批驳回',
    CANCELLED = '已解除'
}

@Entity()
export class Booking {
    @PrimaryGeneratedColumn({
        comment: '预订ID'
    })
    id: number

    @Column({
        comment: '开始时间',
        nullable: false
    })
    start_time: Date

    @Column({
        comment: '结束时间',
        nullable: false
    })
    end_time: Date

    @Column({
        type: 'enum',
        comment: '状态（申请中、审批通过、审批驳回、已解除）',
        default: BookingStatus.PENDING,
        enum: BookingStatus
    })
    status: BookingStatus

    @Column({
        length: 100,
        comment: '备注',
        default: ''
    })
    note: string

   @CreateDateColumn({
    comment: '创建时间'
   })
    create_time: Date

    @UpdateDateColumn({
        comment: '更新时间'
    })
    update_time: Date

    @ManyToOne(() => User)
    user: User

    @ManyToOne(() => MeetingRoom)
    room: MeetingRoom

}
