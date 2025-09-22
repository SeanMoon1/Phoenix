import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNumber,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ description: '로그인 ID', example: 'admin001' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  loginId: string;

  @ApiProperty({ description: '비밀번호', example: 'securePassword123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  password: string;

  @ApiProperty({ description: '관리자명', example: '김관리' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '이메일', example: 'admin@phoenix.com' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(200)
  email: string;

  @ApiProperty({ description: '연락처', example: '010-1234-5678' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ description: '팀 ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  teamId: number;

  @ApiProperty({ description: '권한 레벨 ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  adminLevelId: number;
}
