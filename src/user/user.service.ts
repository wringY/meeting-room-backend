import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginType, User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { md5 } from 'src/utils';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserVo } from './vo/login-user.vo';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserDetailInfo, UserInfoVo, createUserDetailInfo } from './vo/user-detail.vo';
import { UpdatePassWordDto } from './dto/update-password.dto';
import { EmailService } from 'src/email/email.service';
import { UserListVo } from './vo/user-list.vo';


export enum CaptchaType {
  resisterUser = 'register_captcha_',
  updateUser = 'update_user_captcha_',
  updatePassword = 'update_password_captcha_'
}

@Injectable()
export class UserService {
  private logger = new Logger()

  @Inject(JwtService)
  private readonly jwtService: JwtService

  @Inject(ConfigService)
  private readonly configService: ConfigService

  @InjectRepository(User)
  private readonly userRepository: Repository<User>

  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>

  @InjectRepository(Permission)
  private readonly permissionRepository: Repository<Permission>


  @Inject(RedisService)
  private readonly redisService: RedisService

  @Inject(EmailService)
  private readonly emailService: EmailService

  async login(loginUser: LoginUserDto, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUser.username,
        loginType: LoginType.USERNAME_PASSWORD,
        isAdmin
      },
      relations: ['roles', 'roles.permission']
    })

    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST)
    }
    if (user.password !== md5(loginUser.password)) {
      throw new HttpException('密码不正确', HttpStatus.BAD_REQUEST)
    }

    const vo = new LoginUserVo()
    const userInfoVo = createUserDetailInfo(user)
    vo.userInfo = userInfoVo
    return vo
  }

  async register(registerUser: RegisterUserDto) {
    // 注册逻辑：
    // 1. 按照email查询 redis中的验证是否有效
    // 2. 按照username查询用户表是否存在
    // 3. 保存数据到user
    const { email, username } = registerUser
    const captcha = await this.redisService.get(CaptchaType.resisterUser + email)

    if (!captcha) {
      throw new BadRequestException('验证码已失效')
    }
    if (captcha !== registerUser.captcha) {
      throw new BadRequestException('验证码不正确')
    }

    const user = await this.userRepository.findOneBy({
      username
    })
    if (user) {
      throw new BadRequestException('用户名已存在')
    }

    try {
      const newUser = new User()
      newUser.username = username
      newUser.password = md5(registerUser.password)
      newUser.email = email
      newUser.nickName = registerUser.nickName
      await this.userRepository.save(newUser)
      return '注册成功'
    } catch (error) {
      this.logger.error(error, UserService)
      return '注册失败'
    }
  }


  async findUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id
      },
    }) as User

    const vo = new UserInfoVo()
    vo.id = user.id
    vo.username = user.username
    vo.nickName = user.nickName
    vo.email = user.email
    vo.headPic = user.head_pic
    vo.phoneNumber = user.phone_number
    vo.isFrozen = user.isAdmin
    vo.isAdmin = user.isFrozen
    vo.createTime= user.createTime

    return vo
  }

  async findUserDetailById(id: number, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        id,
        isAdmin
      },
      relations: ['roles', 'roles.permission']
    }) as User

    const userVO = createUserDetailInfo(user)

    return userVO
  }

  async updatePassword(updatePassword: UpdatePassWordDto) {
    // 首先从redis中判断验证是否有效
    const captcha = await this.redisService.get(CaptchaType.updatePassword + updatePassword.email)
    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST)
    }
    if (captcha !== updatePassword.captcha) {
      throw new BadRequestException('验证码不正确')
    }
    // 更新数据库
    try {
      this.userRepository.update({
        username: updatePassword.username
      }, {
        password: md5(updatePassword.password)
      })
      return '密码修改成功'
    } catch (error) {
      this.logger.error(error, UserService)
    }
  }

  async update(id: number, updateUser: UpdateUserDto) {
    const captcha = await this.redisService.get(CaptchaType.updateUser + updateUser.email)
    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST)
    }

    if (captcha !== updateUser.captcha) {
      throw new BadRequestException('验证码不正确')
    }

    const foundUser = await this.userRepository.findOneBy({
      id
    })
    if (!foundUser) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST)
    }

    if (updateUser.nickName) {
      foundUser.nickName = updateUser.nickName
    }

    if (updateUser.headPic) {
      foundUser.head_pic = updateUser.headPic
    }

    try {
      await this.userRepository.save(foundUser)
      return '更新成功'
    } catch (error) {
      this.logger.error(error, UserService)
    }
  }

  jwtSign(userInfo: UserDetailInfo) {
    const access_token = this.jwtService.sign({
      userId: userInfo.id,
      username: userInfo.username,
      email: userInfo.email,
      roles: userInfo.roles,
      permissions: userInfo.permissions
    }, {
      expiresIn: this.configService.get('jwt_access_token_expires_time')
    })

    const refresh_token = this.jwtService.sign({
      userId: userInfo.id
    }, {
      expiresIn: this.configService.get('jwt_refresh_token_expres_time')

    })
    return { access_token, refresh_token }
  }

  async sendCaptcha(email: string, type: CaptchaType) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(`${type}${email}`, code)

    await this.emailService.sendMail({
      to: email,
      subject: '验证码',
      html: `<p>你的验证码是 ${code}</p>`
    })
  }

  async freezeUserById(id: number) {
    const user = await this.userRepository.findOneBy({
      id
    })
    if (!user) {
      throw new HttpException('非法id', HttpStatus.BAD_REQUEST)
    }
    user.isFrozen = true

    await this.userRepository.save(user)
    return '冻结成功'
  }

  async findUserByPage(pageNo: number, pageSize: number, username: string, email: string, nickName: string) {
    // 计算出跳过多少条
    const skipCount = (pageNo - 1) * pageSize

    const condition: Record<string, any> = {}
    if (username) {
      condition.username = Like(`%${username}%`)
    }
    if (email) {
      condition.email = Like(`%${email}%`)
    }
    if (nickName) {
      condition.nickName = Like(`%${nickName}%`)
    }

    const [users, count] = await this.userRepository.findAndCount({
      skip: skipCount,
      take: pageSize,
      where: condition,
      select: ['id', 'username', 'email', 'phone_number', 'isFrozen', 'head_pic', 'createTime']
    })
    const vo = new UserListVo()
    vo.list = users as unknown as UserInfoVo[]
    vo.pageSize = count
    vo.pageSize = pageSize
    vo.pageNo = pageNo
    return vo
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
        isAdmin: false
      },
      relations: ['roles', 'roles.permission']
    })

    return user
  }


  async registerByGoogleInfo(email: string, nickName: string, headPic: string) {
    const user = new User()
    user.email = email
    user.nickName = nickName
    user.head_pic = headPic
    user.password = ''
    user.username = email.slice(0, email.indexOf('@')) + Math.random().toString().slice(2, 10)
    user.loginType = LoginType.GOOGLE

    return this.userRepository.save(user)
  }

  async initData() {
    const user1 = new User()
    user1.username = 'zhangsan',
      user1.password = md5('123456')
    user1.nickName = '张三'
    user1.email = 'zhangsan@qq.com'
    user1.isAdmin = true
    user1.phone_number = '13212345678'

    const user2 = new User()
    user2.username = 'lisi',
      user2.password = md5('222222')
    user2.nickName = '李四'
    user2.email = 'lisi@qq.com'

    const role1 = new Role()
    role1.name = '管理员'

    const role2 = new Role()
    role2.name = '普通用户'

    const permission1 = new Permission()
    permission1.code = 'ccc'
    permission1.description = '访问 ccc 接口'

    const permission2 = new Permission()
    permission2.code = 'ddd'
    permission2.description = '访问 ddd 接口'

    user1.roles = [role1]
    user2.roles = [role2]

    role1.permission = [permission1, permission2]
    role2.permission = [permission1]


    await this.permissionRepository.save([permission1, permission2])
    await this.roleRepository.save([role1, role2])
    await this.userRepository.save([user1, user2])
  }

}
