import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateScenarioDto {
  @ApiProperty({ example: 1, description: '팀 ID' })
  @IsNumber()
  @IsNotEmpty()
  teamId: number;

  @ApiProperty({ example: 'SCEN001', description: '시나리오 코드' })
  @IsString()
  @IsNotEmpty()
  scenarioCode: string;

  @ApiProperty({ example: '화재 대응 훈련', description: '시나리오 제목' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '화재',
    description: '재난 유형 (자유 입력)',
  })
  @IsString()
  @IsNotEmpty()
  disasterType: string;

  @ApiProperty({
    example: '건물 화재 상황에서의 대응 훈련 시나리오입니다.',
    description: '시나리오 설명',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'MEDIUM',
    description: '위험도',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'],
  })
  @IsString()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'])
  riskLevel: string;

  @ApiProperty({
    example: '건물 내부 화재 발생',
    description: '발생 조건',
    required: false,
  })
  @IsString()
  @IsOptional()
  occurrenceCondition?: string;

  @ApiProperty({
    example: '임시저장',
    description: '시나리오 상태',
    enum: ['임시저장', '승인대기', '활성화', '비활성화'],
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsIn(['임시저장', '승인대기', '활성화', '비활성화'])
  status?: string;

  @ApiProperty({
    example: '승인 완료',
    description: '승인 코멘트',
    required: false,
  })
  @IsString()
  @IsOptional()
  approvalComment?: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: '이미지 URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    example: 'https://example.com/video.mp4',
    description: '비디오 URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({ example: 1, description: '생성자 ID' })
  @IsNumber()
  @IsNotEmpty()
  createdBy: number;
}
