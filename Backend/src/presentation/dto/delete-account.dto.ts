import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RequestAccountDeletionDto {
  @ApiProperty({ description: '이메일 주소' })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email: string;
}

export class VerifyDeletionCodeDto {
  @ApiProperty({ description: '이메일 주소' })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email: string;

  @ApiProperty({ description: '인증 코드' })
  @IsString()
  @MinLength(6, { message: '인증 코드는 6자리여야 합니다.' })
  @MaxLength(6, { message: '인증 코드는 6자리여야 합니다.' })
  code: string;
}

export class DeleteAccountDto {
  @ApiProperty({ description: '이메일 주소' })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email: string;

  @ApiProperty({ description: '인증 코드' })
  @IsString()
  @MinLength(6, { message: '인증 코드는 6자리여야 합니다.' })
  @MaxLength(6, { message: '인증 코드는 6자리여야 합니다.' })
  code: string;
}
