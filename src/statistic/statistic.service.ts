import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meet-room.entity';
import { User } from 'src/user/entities/user.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class StatisticService {
    @InjectEntityManager()
    private readonly entityManager: EntityManager;

    async useBookingCount(startTime: string, endTime: string) {
        const res = await this.entityManager.createQueryBuilder(Booking, 'b')
            .select('u.id', '用户id')
            .addSelect('u.username', '用户名')
            .addSelect('count(1)', '预订次数')
            .leftJoin(User, 'u', 'b.userId = u.id')
            .where('b.startTime between :time1 and :time2', {
                time1: startTime,
                time2: endTime
            })
            .addGroupBy('b.user')
            .getRawMany()

        return res
    }

    async meetingRoomUsedCount(startTime: string, endTime: string) {
        const res = await this.entityManager
            .createQueryBuilder(Booking, 'b')
            .select('m.id', 'meetingRoomId')
            .addSelect('m.name', 'meetingRoomName')
            .addSelect('count(1)', 'usedCount')
            .leftJoin(MeetingRoom, 'm', 'b.roomId = m.id')
            .where('b.startTime between :time1 and :time2', {
                time1: startTime, 
                time2: endTime
            })
            .addGroupBy('b.roomId')
            .getRawMany();
        return res;
    }
    
}
