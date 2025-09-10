import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateCodeDto {
  @ApiProperty({
    description: '팀 ID (NULL이면 시스템 공통 코드)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  teamId?: number;

  @ApiProperty({ description: '코드 분류' })
  @IsNotEmpty()
  @IsString()
  codeClass: string;

  @ApiProperty({ description: '코드명' })
  @IsNotEmpty()
  @IsString()
  codeName: string;

  @ApiProperty({ description: '코드값' })
  @IsNotEmpty()
  @IsString()
  codeValue: string;

  @ApiProperty({ description: '코드 설명', required: false })
  @IsOptional()
  @IsString()
  codeDesc?: string;

  @ApiProperty({ description: '코드 순서' })
  @IsNotEmpty()
  @IsNumber()
  codeOrder: number;

  @ApiProperty({ description: '생성자 ID', required: false })
  @IsOptional()
  @IsNumber()
  createdBy?: number;
}
