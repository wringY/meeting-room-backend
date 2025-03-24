import { Module } from '@nestjs/common';
import { GoogleStrategy } from './google.strategy';
import { UserModule } from 'src/user/user.module';
import { LocalStrategy } from './local.strategy';

@Module({
    imports: [UserModule],
    providers: [LocalStrategy, GoogleStrategy]
})
export class AuthModule {}
