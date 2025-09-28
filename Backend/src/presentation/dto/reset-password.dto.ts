import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({ description: '이메일 주소', example: 'user@example.com' })
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email: string;
}

export class VerifyResetCodeDto {
  @ApiProperty({ description: '이메일 주소', example: 'user@example.com' })
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email: string;

  @ApiProperty({ description: '인증 코드', example: '123456' })
  @IsNotEmpty({ message: '인증 코드를 입력해주세요.' })
  @IsString({ message: '인증 코드는 문자열이어야 합니다.' })
  code: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: '이메일 주소', example: 'user@example.com' })
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email: string;

  @ApiProperty({ description: '인증 코드', example: '123456' })
  @IsNotEmpty({ message: '인증 코드를 입력해주세요.' })
  @IsString({ message: '인증 코드는 문자열이어야 합니다.' })
  code: string;

  @ApiProperty({ description: '새 비밀번호', example: 'newPassword123!' })
  @IsNotEmpty({ message: '새 비밀번호를 입력해주세요.' })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  newPassword: string;
}
