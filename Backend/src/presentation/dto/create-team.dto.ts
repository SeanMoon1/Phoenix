import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({
    example: 'TEAM001',
    description: '팀 코드 (제공하지 않으면 자동 생성됩니다)',
    required: false,
  })
  @IsString()
  @IsOptional()
  teamCode?: string;

  @ApiProperty({ example: '개발팀', description: '팀 이름' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '개발 관련 업무를 담당하는 팀입니다.',
    description: '팀 설명',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'ACTIVE',
    description: '팀 상태',
    enum: ['ACTIVE', 'INACTIVE'],
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 1, description: '생성자 ID', required: false })
  @IsNumber()
  @IsOptional()
  createdBy?: number;
}
