import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { FormatResponseInterceptor } from './inerceptors/format-response.interceptor';
import { InvokeRecordInterceptor } from './inerceptors/invoke-record.interceptor';
import { UnloginFilter } from './filters/unlogin.filter';
import { CustomExceptionFilter } from './filters/custom-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalInterceptors(new FormatResponseInterceptor())
  app.useGlobalInterceptors(new InvokeRecordInterceptor())
  app.useGlobalFilters(new UnloginFilter())
  app.useGlobalFilters(new CustomExceptionFilter())
  app.useStaticAssets('uploads', {
    prefix: '/uploads'
  })
  

  const config = new DocumentBuilder()
    .setTitle('会议室预订系统')
    .setDescription('api 接口文档')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      description: '基于 jwt 的认证'
    })
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api-doc', app, document)

  const configService = app.get(ConfigService)
  await app.listen(process.env.PORT ?? configService.get('nest_server_port')!);
}
bootstrap();
