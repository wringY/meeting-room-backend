import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, Max, MaxLength, MinLength } from "class-validator"

export class CreateMeetingRoomDto {

    @ApiProperty({
        maxLength: 10
    })
    @IsNotEmpty({
        message: '会议室名称不能为空'
    })
    @MaxLength(10, {
        message: '会议室名称最长为10个字符'
    })
    name: string

    @ApiProperty()
    @IsNotEmpty({
        message: '会议室容纳人数不能为空'
    })
    capacity: number

    @ApiProperty({
        maxLength: 50
    })
    @IsNotEmpty({
        message: '会议室位置不能为空'
    })
    @MaxLength(50, {
        message: '会议室位置最大为50个字符'
    })
    location: string

    @ApiProperty({
        maxLength: 50
    })
    @IsNotEmpty({
        message: '设备不能为空'
    })
    @MaxLength(50, {
        message: '设备最长为 50 字符'
    })
    equipment: string
    
    @ApiProperty({
        maxLength: 100
    })
    @IsNotEmpty({
        message: '描述不能为空'
    })
    @MaxLength(100, {
        message: '描述最长为 100 字符'
    })
    description: string
}