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
  @ApiProperty({ example: 1, description: '팀 ID', required: false })
  @IsNumber()
  @IsOptional()
  teamId?: number;

  @ApiProperty({
    example: 'USER001',
    description: '사용자 코드',
    required: false,
  })
  @IsString()
  @IsOptional()
  userCode?: string;

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

  // OAuth 관련 필드들
  @ApiProperty({
    example: 'google',
    description: 'OAuth 제공자',
    required: false,
  })
  @IsString()
  @IsOptional()
  oauthProvider?: string;

  @ApiProperty({
    example: '1234567890',
    description: 'OAuth 제공자 사용자 ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  oauthProviderId?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: '프로필 이미지 URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @ApiProperty({
    example: 'password123',
    description: '비밀번호',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

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
