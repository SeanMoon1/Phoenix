import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateTrainingResultDto {
  @ApiProperty({ description: '참가자 ID' })
  @IsNotEmpty()
  @IsNumber()
  participantId: number;

  @ApiProperty({ description: '세션 ID' })
  @IsNotEmpty()
  @IsNumber()
  sessionId: number;

  @ApiProperty({ description: '시나리오 ID' })
  @IsNotEmpty()
  @IsNumber()
  scenarioId: number;

  @ApiProperty({ description: '사용자 ID' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ description: '정확도 점수' })
  @IsNotEmpty()
  @IsNumber()
  accuracyScore: number;

  @ApiProperty({ description: '속도 점수' })
  @IsNotEmpty()
  @IsNumber()
  speedScore: number;

  @ApiProperty({ description: '총점' })
  @IsNotEmpty()
  @IsNumber()
  totalScore: number;

  @ApiProperty({ description: '완료 시간 (초)', required: false })
  @IsOptional()
  @IsNumber()
  completionTime?: number;

  @ApiProperty({ description: '피드백', required: false })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiProperty({ description: '완료일시' })
  @IsNotEmpty()
  @IsDateString()
  completedAt: string;
}
