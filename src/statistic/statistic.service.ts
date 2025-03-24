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

    async useBookingCount(start_time: string, end_time: string) {
        const res = await this.entityManager.createQueryBuilder(Booking, 'b')
            .select('u.id', '用户id')
            .addSelect('u.username', '用户名')
            .addSelect('count(1)', '预订次数')
            .leftJoin(User, 'u', 'b.userId = u.id')
            .where('b.start_time between :time1 and :time2', {
                time1: start_time,
                time2: end_time
            })
            .addGroupBy('b.user')
            .getRawMany()

        return res
    }

    async meetingRoomUsedCount(start_time: string, end_time: string) {
        const res = await this.entityManager
            .createQueryBuilder(Booking, 'b')
            .select('m.id', 'meetingRoomId')
            .addSelect('m.name', 'meetingRoomName')
            .addSelect('count(1)', 'usedCount')
            .leftJoin(MeetingRoom, 'm', 'b.roomId = m.id')
            .where('b.start_time between :time1 and :time2', {
                time1: start_time, 
                time2: end_time
            })
            .addGroupBy('b.roomId')
            .getRawMany();
        return res;
    }
    
}
