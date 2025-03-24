import { IsNotEmpty, IsNumber } from "class-validator"

export class CreateBookingDto {

    @IsNotEmpty({ message: '会议室ID不能为空' })
    meetingRoomId: number

    @IsNotEmpty({ message: '开始时间不能为空' })
    @IsNumber()
    start_time: number
    
    @IsNotEmpty({ message: '开始时间不能为空' })
    @IsNumber()
    end_time: number
}   
