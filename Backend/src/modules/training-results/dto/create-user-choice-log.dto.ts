import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CreateUserChoiceLogDto {
  @ApiProperty({ description: '결과 ID' })
  @IsNotEmpty()
  @IsNumber()
  resultId: number;

  @ApiProperty({ description: '이벤트 ID' })
  @IsNotEmpty()
  @IsNumber()
  eventId: number;

  @ApiProperty({ description: '선택지 ID' })
  @IsNotEmpty()
  @IsNumber()
  choiceId: number;

  @ApiProperty({ description: '응답 시간 (초)' })
  @IsNotEmpty()
  @IsNumber()
  responseTime: number;

  @ApiProperty({ description: '정답 여부' })
  @IsNotEmpty()
  @IsBoolean()
  isCorrect: boolean;

  @ApiProperty({ description: '선택 시간' })
  @IsNotEmpty()
  @IsDateString()
  selectedAt: string;
}
