import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 1, description: '팀 ID' })
  @IsNumber()
  @IsNotEmpty()
  teamId: number;

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

  @ApiProperty({
    example: 'Y',
    description: '사용 여부',
    enum: ['Y', 'N'],
    required: false,
  })
  @IsString()
  @IsOptional()
  useYn?: string;

  @ApiProperty({ example: 1, description: '사용자 레벨', required: false })
  @IsNumber()
  @IsOptional()
  userLevel?: number;

  @ApiProperty({ example: 0, description: '사용자 경험치', required: false })
  @IsNumber()
  @IsOptional()
  userExp?: number;

  @ApiProperty({ example: 0, description: '총점', required: false })
  @IsNumber()
  @IsOptional()
  totalScore?: number;

  @ApiProperty({
    example: 0,
    description: '완료한 시나리오 개수',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  completedScenarios?: number;

  @ApiProperty({ example: '초급자', description: '현재 등급', required: false })
  @IsString()
  @IsOptional()
  currentTier?: string;

  @ApiProperty({
    example: 0.0,
    description: '현재 레벨에서의 진행도',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  levelProgress?: number;

  @ApiProperty({
    example: 100,
    description: '다음 레벨까지 필요한 경험치',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  nextLevelExp?: number;

  @ApiProperty({
    example: true,
    description: '계정 활성화 상태',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
