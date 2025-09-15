import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user123', description: '로그인 아이디' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  loginId: string;

  @ApiProperty({ example: 'password123', description: '비밀번호' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
