import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserExpDto {
  @ApiProperty({ example: 1, description: '사용자 ID' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ example: 150, description: '추가할 경험치' })
  @IsNumber()
  @IsNotEmpty()
  expToAdd: number;

  @ApiProperty({ example: 95, description: '총 점수', required: false })
  @IsNumber()
  @IsOptional()
  totalScore?: number;

  @ApiProperty({
    example: 1,
    description: '완료한 시나리오 수',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  completedScenarios?: number;

  @ApiProperty({ example: '중급자', description: '현재 등급', required: false })
  @IsString()
  @IsOptional()
  currentTier?: string;
}
