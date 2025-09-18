import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user123', description: '로그인 ID' })
  @IsString()
  @IsNotEmpty()
  loginId: string;

  @ApiProperty({ example: 'password123', description: '비밀번호' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '홍길동', description: '사용자 이름' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'user@example.com', description: '이메일 주소' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'TEAM001', description: '팀 코드', required: false })
  @IsString()
  @IsOptional()
  teamCode?: string;

  @ApiProperty({ example: 1, description: '팀 ID', required: false })
  @IsNumber()
  @IsOptional()
  teamId?: number;
}
