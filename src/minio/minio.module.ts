import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MinioController } from './minio.controller';
import * as Minio from 'minio'


export const MINIO_CLIENT = 'MINIO_CLIENT'

@Global()
@Module({
    providers: [
        {
            provide: MINIO_CLIENT,
            async useFactory(configService: ConfigService) {
                const client = new Minio.Client({
                    endPoint: configService.get('minio_server_host')!,
                    port: configService.get('minio_server_port')!,
                    useSSL: false,
                    accessKey: configService.get('minio_server_access_key')!,
                    secretKey: configService.get('minio_server_secret_key')!
                })
                return client
            },
            inject: [ConfigService]
        }
    ],
    exports: [MINIO_CLIENT],
    controllers: [MinioController]
})
export class MinioModule {}
