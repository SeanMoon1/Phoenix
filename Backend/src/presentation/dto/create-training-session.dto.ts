import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  IsDateString,
} from 'class-validator';

export class CreateTrainingSessionDto {
  @ApiProperty({
    example: '화재 대응 훈련 세션',
    description: '훈련 세션명',
  })
  @IsString()
  @IsNotEmpty()
  sessionName: string;

  @ApiProperty({ example: 1, description: '시나리오 ID' })
  @IsNumber()
  @IsNotEmpty()
  scenarioId: number;

  @ApiProperty({ example: 1, description: '팀 ID', required: false })
  @IsNumber()
  @IsOptional()
  teamId?: number;

  @ApiProperty({
    example: '2024-01-15T09:00:00Z',
    description: '훈련 시작 시간',
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: Date;

  @ApiProperty({
    example: '2024-01-15T11:00:00Z',
    description: '훈련 종료 시간',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endTime?: Date;

  @ApiProperty({
    example: 'scheduled',
    description: '훈련 상태',
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
  status?: string;

  @ApiProperty({ example: 1, description: '생성자 ID' })
  @IsNumber()
  @IsNotEmpty()
  createdBy: number;
}
