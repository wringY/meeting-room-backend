import { Controller, Get, Inject, Query } from '@nestjs/common';
import { StatisticService } from './statistic.service';

@Controller('statistic')
export class StatisticController {

    @Inject(StatisticService)
    private statisticService: StatisticService;

    @Get('userBookingCount')
    async userBookignCount(@Query('start_time') start_time: string, @Query('end_time') end_time) {
        return this.statisticService.useBookingCount(start_time, end_time);
    }

    @Get('meetingRoomUsedCount')
async meetingRoomUsedCount(@Query('start_time') start_time: string, @Query('end_time') end_time) {
    return this.statisticService.meetingRoomUsedCount(start_time, end_time);
}

}
