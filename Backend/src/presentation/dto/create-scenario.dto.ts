import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateScenarioDto {
  @ApiProperty({ example: 1, description: '팀 ID' })
  @IsNumber()
  @IsNotEmpty()
  teamId: number;

  @ApiProperty({ example: 'SCENARIO001', description: '시나리오 코드' })
  @IsString()
  @IsNotEmpty()
  scenarioCode: string;

  @ApiProperty({ example: '화재 대응 시나리오', description: '시나리오 제목' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '화재', description: '재난 유형' })
  @IsString()
  @IsNotEmpty()
  disasterType: string;

  @ApiProperty({ example: '화재 상황에 대한 대응 훈련', description: '시나리오 설명' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '높음', description: '위험도' })
  @IsString()
  @IsNotEmpty()
  riskLevel: string;

  @ApiProperty({ example: '화재 발생 시', description: '발생 조건', required: false })
  @IsString()
  @IsOptional()
  occurrenceCondition?: string;

  @ApiProperty({ example: '임시저장', description: '시나리오 상태', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 'http://example.com/image.jpg', description: '이미지 URL', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: 'http://example.com/video.mp4', description: '비디오 URL', required: false })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({ example: 1, description: '생성자 ID' })
  @IsNumber()
  @IsNotEmpty()
  createdBy: number;
}