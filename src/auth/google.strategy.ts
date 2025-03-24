import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {

    constructor(configService: ConfigService) {
        super({
            clientID: configService.get('google_client_id')!,
            clientSecret: configService.get('google_client_secret')!,
            callbackURL: configService.get('google_redirect_uri')!,
            scope: ['email', 'profile']
        })
    }

    validate(accessToken: string, refreshToken: string, profile: any) {
        const { name, emails, photos } = profile
        const user = {
          email: emails[0].value,
          firstName: name.givenName,
          lastName: name.familyName,
          picture: photos[0].value,
          accessToken
        }
        return user;
    }
}   