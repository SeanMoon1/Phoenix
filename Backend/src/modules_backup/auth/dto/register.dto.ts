import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsNumber,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'TEAM001',
    description: '팀 코드 (팀 관리자로부터 받은 코드)',
  })
  @IsString()
  @IsNotEmpty()
  teamCode: string;

  @ApiProperty({ example: 'USER001', description: '사용자 코드' })
  @IsString()
  @IsNotEmpty()
  userCode: string;

  @ApiProperty({ example: 'user001', description: '로그인 ID' })
  @IsString()
  @IsNotEmpty()
  loginId: string;

  @ApiProperty({ example: '홍길동', description: '사용자 이름' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'user@example.com', description: '이메일 주소' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: '비밀번호' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
