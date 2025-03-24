import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Inject, UnauthorizedException, ParseIntPipe, BadRequestException, DefaultValuePipe, HttpStatus, UseInterceptors, UploadedFile, UseGuards, Req, Res } from '@nestjs/common';
import { CaptchaType, UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto'
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';
import { LoginUserDto } from './dto/login-user.dto'
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RequireLogin, UserInfo } from 'src/decorator/custom.decorator';
import { UpdatePassWordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { generateParseIntPipe } from 'src/utils';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginUserVo } from './vo/login-user.vo';
import { RefeshTokenVo } from './vo/refresh-token.vo';
import { UserDetailInfo, createUserDetailInfo } from './vo/user-detail.vo';
import { UserListVo } from './vo/user-list.vo';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path'
import { storage } from 'src/my-file-storage';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';


@ApiTags('用户管理模块')
@Controller('user')
export class UserController {

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  constructor(private readonly userService: UserService) { }

  @ApiOperation({
    summary: '用户注册'
  })
  @ApiBody({
    type: RegisterUserDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/验证码不正确/用户名已存在',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '注册成功/注册失败',
    type: String
  })
  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser)
  }

  @ApiOperation({
    summary: '注册验证码'
  })
  @ApiQuery({
    name: 'address',
    type: String,
    description: '邮箱地址',
    required: true,
    example: 'xxx@xx.com'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '发送成功',
    type: String
  })
  @Get('register-captcha')
  async captcha(@Query('address') address: string) {
    await this.userService.sendCaptcha(address, CaptchaType.resisterUser)
    return '发送成功'

  }

  @ApiOperation({
    summary: '用户登录'
  })
  @ApiBody({
    type: LoginUserDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在/密码不正确',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和 token',
    type: LoginUserVo
  })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@UserInfo() vo: LoginUserVo) {
    const { access_token, refresh_token } = this.userService.jwtSign(vo.userInfo)

    vo.access_token = access_token

    vo.refresh_token = refresh_token
    return vo
  }

  @ApiOperation({
    summary: '管理员登录'
  })
  @ApiBody({
    type: LoginUserDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在/密码不正确',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和 token',
    type: LoginUserVo
  })
  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, true)
    return vo
  }


  @ApiOperation({
    summary: '普通用户 access token失效，刷新token'
  })
  @ApiQuery({
    name: 'refreshToken',
    type: String,
    description: '刷新 token',
    required: true,
    example: 'xxxxxxxx.yyyyyy.zzzz'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token已失效, 请重新登录',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: RefeshTokenVo
  })
  @Get('refresh')
  @RequireLogin()
  @ApiBearerAuth()
  async refresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken)

      const user = await this.userService.findUserDetailById(data.userId, false)

      const { access_token, refresh_token } = this.userService.jwtSign(user)

      const vo = new RefeshTokenVo()
      vo.access_token = access_token
      vo.refresh_token = refresh_token
      return vo

    } catch (error) {
      throw new UnauthorizedException('token已失效，请重新登录')
    }
  }

  @ApiOperation({
    summary: '管理员 access token失效，刷新token'
  })
  @ApiQuery({
    name: 'refreshToken',
    type: String,
    description: '刷新 token',
    required: true,
    example: 'xxxxxxxx.yyyyyy.zzzz'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token已失效, 请重新登录',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: RefeshTokenVo
  })
  @RequireLogin()
  @ApiBearerAuth()
  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken)

      const user = await this.userService.findUserDetailById(data.userId, true)

      const { access_token, refresh_token } = this.userService.jwtSign(user)

      return {
        access_token,
        refresh_token
      }

    } catch (error) {
      throw new UnauthorizedException('token已失效，请重新登录')
    }
  }

  @ApiOperation({
    summary: '更新用户信息'
  })
  @ApiBody({
    type: UpdateUserDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/不正确/用户不存在',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '更新成功',
    type: String
  })
  @Post(['update', 'admin/update'])
  @RequireLogin()
  @ApiBearerAuth()
  async update(@UserInfo('userId') id: number, @Body() updateUser: UpdateUserDto) {
    return await this.userService.update(id, updateUser)
  }

  @ApiOperation({
    summary: '更新用户信息验证码'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '发送成功',
    type: String
  })
  @Get('update/captcha')
  @RequireLogin()
  @ApiBearerAuth()
  async updateCaptcha(@UserInfo('eamil') address: string) {
    await this.userService.sendCaptcha(address, CaptchaType.updateUser)
    return '发送成功'
  }

  @ApiOperation({
    summary: '更新密码'
  })
  @ApiBody({
    type: UpdatePassWordDto
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: String,
    description: '验证码已失效/不正确'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: String,
    description: '密码修改成功'
  })
  @Post(['update_password', 'admin/update_password'])
  async updatePassword(@Body() updatePassword: UpdatePassWordDto) {
    return await this.userService.updatePassword(updatePassword)
  }

  @ApiOperation({
    summary: '获取更新密码验证码'
  })
  @ApiQuery({
    name: 'address',
    type: String,
    description: '邮箱地址',
    example: 'xxx@xx.com'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: String,
    description: '发送成功'
  })
  @Get('update_password/captcha')
  async updatePasswordCaptcha(@Query('address') address: string) {
    await this.userService.sendCaptcha(address, CaptchaType.updatePassword)
    return '发送成功'
  }


  @ApiOperation({
    summary: '获取用户信息'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'success',
    type: UserDetailInfo
  })
  @Get('info')
  @RequireLogin()
  @ApiBearerAuth()
  async info(@UserInfo('userId', ParseIntPipe) id: number) {
    return await this.userService.findUserById(id)
  }

  @ApiOperation({
    summary: '获取用户列表'
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'pageNo',
    description: '第几页',
    type: Number
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页多少条',
    type: Number
  })
  @ApiQuery({
    name: 'username',
    description: '用户名',
    type: Number
  })
  @ApiQuery({
    name: 'nickName',
    description: '昵称',
    type: Number
  })
  @ApiQuery({
    name: 'email',
    description: '邮箱地址',
    type: Number
  })
  @ApiResponse({
    type: UserListVo,
    description: '用户列表',
    status: HttpStatus.OK
  })
  @RequireLogin()
  @ApiBearerAuth()
  @Get('list')
  async list(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo')) pageNo: number,
    @Query('pageSzie', new DefaultValuePipe(2), generateParseIntPipe('pageSzie')) pageSize: number,
    @Query('username') username: string,
    @Query('email') email: string,
    @Query('nickName') nickName: string,
  ) {
    return await this.userService.findUserByPage(pageNo, pageSize, username, email, nickName)
  }

  @ApiOperation({
    summary: '冻结用户',
  })
  @ApiQuery({
    name: 'id',
    description: '用户id',
    required: true
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '非法id',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '冻结成功'
  })
  @Get('freeze')
  @RequireLogin()
  @ApiBearerAuth()
  async freeze(@Query('id') id: number) {
    return await this.userService.freezeUserById(id)
  }

  @ApiOperation({
    summary: '开发环境初始化数据，线上环境用导入sql完成数据初始化'
  })
  @Get('init-data')
  async initData() {
    await this.userService.initData()
    return 'done'
  }

  @ApiOperation({
    summary: '上传文件'
  })
  @ApiBody({
    type: FileInterceptor('file')
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '上传成功',
    type: String
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    dest: 'uploads',
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 3
    },
    fileFilter(req, file, callback) {
      const extname = path.extname(file.originalname)
      if (['.png', '.jpg', '.gif'].includes(extname)) {
        callback(null, true)
      } else {
        callback(new BadRequestException('只能上传图片'), false)
      }
    },
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return file.path
  }


  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {

  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    if (!req.user) {
      throw new BadRequestException('google 登录失败')
    }

    const { email, picture, firstName, lastName } = req.user
    let foundUser = await this.userService.findUserByEmail(email)

    if (!foundUser) {
      foundUser = await this.userService.registerByGoogleInfo(email, firstName + lastName, picture)
    }

    const userInfo = createUserDetailInfo(foundUser)
    const { access_token, refresh_token } = this.userService.jwtSign(userInfo)

    res.cookie('userInfo', JSON.stringify(userInfo));
    res.cookie('accessToken', access_token);
    res.cookie('refreshToken', refresh_token);
    res.redirect('http://localhost:3000/')
  }


}
