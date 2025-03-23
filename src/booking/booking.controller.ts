import { Controller, Get, Post, Body, Patch, Param, Delete, Query, DefaultValuePipe } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { RequireLogin, UserInfo } from 'src/decorator/custom.decorator';
import { generateParseIntPipe } from 'src/utils';

@RequireLogin()
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('list')
  async list(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo')) pageNo: number,
    @Query('pageSize', new DefaultValuePipe(2), generateParseIntPipe('pageSize')) pageSize: number,
    @Query('meetingRoomName') meetingRoomName: string,
    @Query('meetingRoomPosition') meetingRoomPosition: string,
    @Query('bookingTimeRangeStart') bookingTimeRangeStart: number,
    @Query('bookingTimeRangeEnd') bookingTimeRangeEnd: number,
    @Query('username') username: string
  ) {
   return await this.bookingService.find(pageNo, pageSize, username, meetingRoomName, meetingRoomPosition, bookingTimeRangeStart, bookingTimeRangeEnd)
  }
  
  @Get('apply/:id')
  async apply(@Param('id') id: number) {
    return this.bookingService.reject(id)
  }

  @Get('reject/:id')
  async reject(@Param('id') id: number) {
    return this.bookingService.reject(id)
  }

  @Get('unbind/:id')
  async unbind(@Param('id') id: number) {
    return this.bookingService.reject(id)
  }

  @Post('add')
  async add(@UserInfo('userId') userId: number,  @Body() booking: CreateBookingDto) {
    return this.bookingService.add(userId, booking)
  }

  @Get('upge')
  async upge(@Param('id') id: number) {
    return this.bookingService.upge(id)
  }
  
}
