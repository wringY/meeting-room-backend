import { ApiProperty } from "@nestjs/swagger"

export  class RefeshTokenVo {
    @ApiProperty()
    access_token: string
    
    @ApiProperty()
    refresh_token: string
}