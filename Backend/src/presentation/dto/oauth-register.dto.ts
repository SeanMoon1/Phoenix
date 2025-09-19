import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class OAuthRegisterDto {
  @ApiProperty({ example: 'user@example.com', description: '이메일 주소' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '홍길동', description: '사용자 이름' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'google', description: 'OAuth 제공자' })
  @IsString()
  @IsNotEmpty()
  oauthProvider: string;

  @ApiProperty({ example: '123456789', description: 'OAuth 제공자 사용자 ID' })
  @IsString()
  @IsNotEmpty()
  oauthProviderId: string;

  @ApiProperty({ example: 'TEAM001', description: '팀 코드', required: false })
  @IsString()
  @IsOptional()
  teamCode?: string;

  @ApiProperty({ example: 1, description: '팀 ID', required: false })
  @IsNumber()
  @IsOptional()
  teamId?: number;
}
