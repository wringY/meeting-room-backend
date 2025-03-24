import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Between, EntityManager, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meet-room.entity';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class BookingService {
  @InjectRepository(Booking)
  private readonly repository: Repository<Booking>;

  @InjectEntityManager()
  private readonly entityManager: EntityManager;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(EmailService)
  private readonly emailService: EmailService;

  async find(
    pageNo: number,
    pageSize: number,
    username: string,
    meetingRoomName: string,
    meetingRoomPosition: string,
    bookingTimeRangeStart: number,
    bookingTimeRangeEnd: number
  ) {
    const skipCount = (pageNo - 1) * pageSize;

    const condition: Record<string, any> = {};

    if (username) {
      condition.user = {
        username: Like(`%${username}%`)
      }
    }

    if (meetingRoomName) {
      condition.room = {
        name: Like(`%${meetingRoomName}%`)
      }
    }

    if (meetingRoomPosition) {
      if (!condition.room) {
        condition.room = {}
      }
      condition.room.location = Like(`%${meetingRoomPosition}%`)
    }

    if (bookingTimeRangeStart) {
      if (!bookingTimeRangeEnd) {
        bookingTimeRangeEnd = bookingTimeRangeStart + 60 * 60 * 1000
      }
      condition.start_time = Between(new Date(bookingTimeRangeStart), new Date(bookingTimeRangeEnd))
    }


    const [bookings, count] = await this.repository.findAndCount({
      where: condition,
      relations: {
        user: true,
        room: true
      },
      skip: skipCount,
      take: pageSize
    })

    return {
      bookings: bookings.map(item => {
        Reflect.deleteProperty(item.user, 'password')
        return item;
      }), count
    }

  }

  async initData() {
    const user1 = await this.entityManager.findOneBy(User, {
      id: 1
    })

    const user2 = await this.entityManager.findOneBy(User, {
      id: 2
    })

    const room1 = await this.entityManager.findOneBy(MeetingRoom, {
      id: 1
    })

    const room2 = await this.entityManager.findOneBy(MeetingRoom, {
      id: 2
    })


    const booking1 = new Booking()
    booking1.room = room1!
    booking1.user = user1!
    booking1.start_time = new Date();
    booking1.end_time = new Date(Date.now() + 1000 * 60 * 60);

    await this.repository.save(booking1)


    const booking2 = new Booking();
    booking2.room = room2!;
    booking2.user = user2!;
    booking2.start_time = new Date();
    booking2.end_time = new Date(Date.now() + 1000 * 60 * 60);
    await this.entityManager.save(Booking, booking2);

    const booking3 = new Booking();
    booking3.room = room1!;
    booking3.user = user2!;
    booking3.start_time = new Date();
    booking3.end_time = new Date(Date.now() + 1000 * 60 * 60);
    await this.entityManager.save(Booking, booking3);


    const booking4 = new Booking();
    booking4.room = room2!;
    booking4.user = user1!;
    booking4.start_time = new Date();
    booking4.end_time = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking4);


  }

  async add(userId: number, booking: CreateBookingDto) {
    const room = await this.entityManager.findOneBy(MeetingRoom, {
      id: booking.meetingRoomId
    })

    if (!room) {
      throw new HttpException('会议室不存在', HttpStatus.BAD_REQUEST)
    }

    const user = await this.entityManager.findOneBy(User, {
      id: userId
    })

    const newBooking = new Booking()
    newBooking.room = room;
    newBooking.user = user!;
    
    newBooking.start_time = new Date(booking.start_time);
    newBooking.end_time = new Date(booking.end_time);

    

    const hasBooked = await this.repository.findOneBy({
      room: {
        id: room.id
      },
      start_time: LessThanOrEqual(newBooking.start_time),
      end_time: MoreThanOrEqual(newBooking.end_time)
    })

    if (hasBooked) {
      throw new BadRequestException('该时间段已被预定')
    }

    const res = await this.entityManager.save(Booking, newBooking)
    return res.id

  }

  async apply(id: number) {
    await this.entityManager.update(Booking, {
      id
    }, {
      status: BookingStatus.APPROVED
    });
    return 'success'
  }

  async reject(id: number) {
    await this.entityManager.update(Booking, {
      id
    }, {
      status: BookingStatus.REJECTED
    });
    return 'success'
  }

  async unbind(id: number) {
    await this.entityManager.update(Booking, {
      id
    }, {
      status: BookingStatus.CANCELLED
    });
    return 'success'
  }

  async upge(id: number) {
    const flag = await this.redisService.get(`urg_${id}`)

    if (flag) {
      return '半小时内只能催办一次，请耐心等待';
    }

    let email = await this.redisService.get('admin_email')

    if (!email) {
      const admin = await this.entityManager.findOne(User, {
        where: {
          isAdmin: true
        },
        select: ['email']
      })

      email = admin!.email
      
    }

    this.emailService.sendMail({
      to: email,
      subject: '预定申请催办提醒',
      html: `id 为 ${id} 的预定申请正在等待审批`
    })

    this.redisService.set(`urg_${id}`, 1, 60 * 30)
  }


}
