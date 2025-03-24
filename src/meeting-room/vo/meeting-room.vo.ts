import { ApiProperty } from "@nestjs/swagger";

export class MeetingRoomVo {
    
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    capacity: number;

    @ApiProperty()
    location: string;

    @ApiProperty()
    equipment: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    is_booked: boolean;

    @ApiProperty()
    create_time: Date;

    @ApiProperty()
    update_time: Date;
}
