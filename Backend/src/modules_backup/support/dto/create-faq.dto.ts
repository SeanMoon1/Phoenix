import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFaqDto {
  @ApiProperty({ description: '팀 ID' })
  @IsNotEmpty()
  @IsNumber()
  teamId: number;

  @ApiProperty({ description: '카테고리' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ description: '질문' })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({ description: '답변' })
  @IsNotEmpty()
  @IsString()
  answer: string;

  @ApiProperty({ description: '정렬 순서' })
  @IsNotEmpty()
  @IsNumber()
  orderNum: number;

  @ApiProperty({ description: '생성자 ID' })
  @IsNotEmpty()
  @IsNumber()
  createdBy: number;
}
