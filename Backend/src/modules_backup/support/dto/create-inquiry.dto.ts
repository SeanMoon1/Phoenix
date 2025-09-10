import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateInquiryDto {
  @ApiProperty({ description: '팀 ID' })
  @IsNotEmpty()
  @IsNumber()
  teamId: number;

  @ApiProperty({ description: '사용자 ID' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ description: '카테고리' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ description: '제목' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: '내용' })
  @IsNotEmpty()
  @IsString()
  content: string;
}
