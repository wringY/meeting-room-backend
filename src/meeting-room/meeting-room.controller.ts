import { Body, Controller, DefaultValuePipe, Delete, Get, HttpStatus, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { RequireLogin } from 'src/decorator/custom.decorator';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { generateParseIntPipe } from 'src/utils';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MeetingRoom } from './entities/meet-room.entity';
import { MeetingRoomVo } from './vo/meeting-room.vo';
import { MeetingRoomListVo } from './vo/meeting-room-list.vo';

@ApiTags('会议室管理模块')
@RequireLogin()
@ApiBearerAuth()
@Controller('meeting-room')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) { }

  @ApiOperation({
    summary: "新增会议室"
  })
  @ApiBody({
    type: CreateMeetingRoomDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "会议室已存在/创建失败"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: String,
    description: "新增会议室成功"
  })
  @Post('create')
  async create(@Body() createMeetingRoom: CreateMeetingRoomDto) {
    return await this.meetingRoomService.create(createMeetingRoom)
  }

  @ApiOperation({
    summary: "修改会议室"
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: '会议室id'
  })
  @ApiBody({
    type: UpdateMeetingRoomDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '会议室不存在/更新失败'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '更新成功'
  })
  @Put('update/:id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateMeetingRoom: UpdateMeetingRoomDto) {
    return await this.meetingRoomService.updateMeetingRoom(id, updateMeetingRoom)
  }

  @ApiOperation({
    summary: "修改会议室"
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: '会议室id'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '非法id/删除失败'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '删除成功'
  })
  @Delete('delete/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.meetingRoomService.deleteMeetingRoomById(id)
  }

  @ApiOperation({
    summary: '搜索会议室',
  })
  @ApiQuery({
    name: 'name',
    description: '会议室名称',
    required: false,
  })
  @ApiQuery({
    name: 'capacity',
    description: '会议室容量',
    required: false,
  })
  @ApiQuery({
    name: 'location',
    description: '会议室地点',
    required: false,
  })
  @ApiQuery({
    name: 'description',
    description: '会议室描述',
    required: false,
  })
  @ApiQuery({
    name: 'equipment',
    description: '会议室设备',
    required: false,
  })
  @ApiResponse({
    type: MeetingRoomListVo,
    description: 'success'
  })
  @Get('search')
  async search(
    @Query('name') name: string,
    @Query('capacity') capacity: number,
    @Query('location') location: string,
    @Query('description') description: string,
    @Query('equipment') equipment: string,
  ) {
    return await this.meetingRoomService.searchMeetingRoom(name, capacity, location, description, equipment)
  }

  @ApiOperation({
    summary: '查询所有会议室',
  })
  @ApiQuery({
    name: 'pageNo',
    description: '页码',
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'pageSize',
    required: false,
  })
  @ApiResponse({
    type: MeetingRoomListVo,
    description: 'success'
  })
  @Get('list')
  async list(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo')) pageNo: number,
    @Query('pageSize', new DefaultValuePipe(2), generateParseIntPipe('pageSize')) pageSize: number
  ) {
    return await this.meetingRoomService.getMeetingRoomPage(pageNo, pageSize)
  }

  @ApiOperation({
    summary: '获取会议室详情'
  })
  @ApiParam({
    name: 'id',
    description: '会议室ID'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: MeetingRoomVo
  })
  @Get(':id')
  async find(@Param('id') id: number) {
    return await this.meetingRoomService.findById(id)
  }
}
