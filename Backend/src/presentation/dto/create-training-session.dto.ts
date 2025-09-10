import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateTrainingSessionDto {
  @ApiProperty({ example: 1, description: '팀 ID' })
  @IsNumber()
  @IsNotEmpty()
  teamId: number;

  @ApiProperty({ example: 1, description: '시나리오 ID' })
  @IsNumber()
  @IsNotEmpty()
  scenarioId: number;

  @ApiProperty({ example: '화재 대응 훈련 세션', description: '훈련 세션 제목' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '훈련 세션 설명', description: '세션 설명', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '진행중', description: '세션 상태', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 1, description: '생성자 ID' })
  @IsNumber()
  @IsNotEmpty()
  createdBy: number;
}