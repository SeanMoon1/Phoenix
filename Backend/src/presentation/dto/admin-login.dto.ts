import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ description: '관리자 로그인 ID', example: 'admin' })
  @IsString()
  @IsNotEmpty()
  loginId: string;

  @ApiProperty({ description: '관리자 비밀번호', example: 'admin123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  password: string;
}
