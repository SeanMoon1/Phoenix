import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreateTrainingResultDto {
  @ApiProperty({ example: 1, description: '참가자 ID' })
  @IsNumber()
  @IsNotEmpty()
  participantId: number;

  @ApiProperty({ example: 1, description: '세션 ID' })
  @IsNumber()
  @IsNotEmpty()
  sessionId: number;

  @ApiProperty({ example: 1, description: '시나리오 ID' })
  @IsNumber()
  @IsNotEmpty()
  scenarioId: number;

  @ApiProperty({ example: 1, description: '사용자 ID' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ example: 85, description: '정확도 점수' })
  @IsNumber()
  @IsNotEmpty()
  accuracyScore: number;

  @ApiProperty({ example: 90, description: '속도 점수' })
  @IsNumber()
  @IsNotEmpty()
  speedScore: number;

  @ApiProperty({ example: 87, description: '총점' })
  @IsNumber()
  @IsNotEmpty()
  totalScore: number;

  @ApiProperty({ example: 120, description: '완료 시간 (초)', required: false })
  @IsNumber()
  @IsOptional()
  completionTime?: number;

  @ApiProperty({
    example: '화재 대응 완료 - 레벨 2, 정답 8/10',
    description: '피드백',
    required: false,
  })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiProperty({
    example: '2024-01-15T11:30:00Z',
    description: '완료일시',
  })
  @IsDateString()
  @IsNotEmpty()
  completedAt: Date;
}
