import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class FindIdDto {
  @ApiProperty({ description: '사용자 이름', example: '홍길동' })
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  name: string;

  @ApiProperty({ description: '이메일 주소', example: 'user@example.com' })
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email: string;
}
