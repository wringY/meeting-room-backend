import { IsNotEmpty } from 'class-validator'
import {  CreateMeetingRoomDto } from './create-meeting-room.dto'
import { PartialType } from '@nestjs/mapped-types'
export class UpdateMeetingRoomDto  extends PartialType(CreateMeetingRoomDto) {

}
