import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class OAuthRegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'OAuth 제공자로부터 받은 이메일',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '홍길동',
    description: 'OAuth 제공자로부터 받은 이름',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'google',
    description: 'OAuth 제공자 (google, kakao, naver 등)',
  })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({
    example: '1234567890',
    description: 'OAuth 제공자의 사용자 ID',
  })
  @IsString()
  @IsNotEmpty()
  providerId: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: '프로필 이미지 URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  profileImage?: string;
}
