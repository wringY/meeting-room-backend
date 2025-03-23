import { Controller, Get, SetMetadata, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { RequireLogin, RequirePermission, UserInfo } from './decorator/custom.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  @RequireLogin()
  @RequirePermission('ddd')
  @Get('aaa')
  getHello(@UserInfo('username') username: string, @UserInfo() userInfo ): string {
    console.log(username)
    console.log(userInfo)
    return 'aaa'
  }

  @Get('bbb')
  bbb() {
    return 'bbb'
  }
}
