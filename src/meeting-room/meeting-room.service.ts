import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeetingRoom } from './entities/meet-room.entity';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { MeetingRoomVo } from './vo/meeting-room.vo';

@Injectable()
export class MeetingRoomService {
    @InjectRepository(MeetingRoom)
    private readonly meetingRommRepository: Repository<MeetingRoom>;

    async create(createMeetingRoom: CreateMeetingRoomDto) {
        // const meetingRoom = new MeetingRoom()
        // meetingRoom.name = createMeetingRoom.name
        // meetingRoom.description = createMeetingRoom.description
        // meetingRoom.capacity = createMeetingRoom.capacity
        // meetingRoom.location = createMeetingRoom.location
        // meetingRoom.equipment = createMeetingRoom.equipment

        const room = await this.meetingRommRepository.findOneBy({
            name: createMeetingRoom.name
        })
        if (!room) {
            throw new HttpException('会议室已存在', HttpStatus.BAD_REQUEST)
        }

        try {
            // await this.meetingRommRepository.insert(meetingRoom)

            await this.meetingRommRepository.insert(createMeetingRoom)
            return '创建成功'
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST)
        }
    }

    async updateMeetingRoom(id: number, updateMeetingRoom: UpdateMeetingRoomDto) {

        const meetingRoom = await this.meetingRommRepository.findOneBy({
            id
          })
      
          if(!meetingRoom) {
            throw new BadRequestException('会议室不存在');
          }

        try {
            await this.meetingRommRepository.update({
                id
            }, {
                ...updateMeetingRoom

            })
            return '更新成功'
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST)
        }
    }

    async deleteMeetingRoomById(id: number) {
        try {
            const meetingRomm = await this.meetingRommRepository.findOneBy({
                id
            })
            if (meetingRomm) {
                await this.meetingRommRepository.delete({
                    id
                })
                return '删除成功'
            } else {
                throw new HttpException('非法id', HttpStatus.BAD_REQUEST)
            }

        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST)
        }
    }

    async searchMeetingRoom(name: string, capacity: number, location: string, description: string, equipment: string) {
        const fields = {name, capacity, location, description, equipment}
        const condition = {}

        Object.entries(fields).forEach(([key, value]) => {
            if (value) {
                condition[key] = fields[key]
            }
        })
   
        const [rooms, count] = await this.meetingRommRepository.findAndCount({
            where: condition,
            select: ['name', 'description', 'equipment', 'id', 'capacity', 'is_booked', 'location', 'create_time'],
        })
        return { rooms, count }
    }


    async getMeetingRoomPage(pageNo: number, pageSize: number) {
        if(pageNo < 1) {
            throw new BadRequestException('页码最小为 1');
          }
        const skipCount = (pageNo - 1) * pageSize
        const [rooms, count] = await this.meetingRommRepository.findAndCount({
            skip: skipCount,
            take: pageSize,
            select: ['name', 'description', 'equipment', 'id', 'capacity', 'is_booked', 'location', 'create_time'],
        })
        return { rooms, count }
    }

    async findById(id: number) {
        return this.meetingRommRepository.findOneBy({
            id
        })
    }



    async initData() {
        const room1 = new MeetingRoom()
        room1.name = '木星';
        room1.capacity = 10;
        room1.equipment = '白板';
        room1.location = '一层西';


        const room2 = new MeetingRoom();
        room2.name = '金星';
        room2.capacity = 15;
        room2.equipment = '';
        room2.location = '二层东';

        const room3 = new MeetingRoom();
        room3.name = '天王星';
        room3.capacity = 30;
        room3.equipment = '白板，电视';
        room3.location = '三层东'

        await this.meetingRommRepository.insert([room1, room2, room3])
    }
}
