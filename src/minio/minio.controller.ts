import { Controller, Get, Inject, Query } from '@nestjs/common';
import { MINIO_CLIENT } from './minio.module'
import * as Minio from 'minio'
import { ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@Controller('minio')
export class MinioController {
    @Inject('MINIO_CLIENT')
    private readonly minioClient: Minio.Client

    @Inject(ConfigService)
    private readonly configService: ConfigService

    @ApiOperation({
        summary: '预签名url'
    })
    @Get('persignedUrl')
    persignedPutObject(@Query('name') name: string) {
        return this.minioClient.presignedPutObject(this.configService.get('minio_server_bucket_name')!, name, 3600)
    }
}
