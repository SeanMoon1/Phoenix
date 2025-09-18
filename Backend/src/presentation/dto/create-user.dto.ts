import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Login ID', example: 'user123' })
  @IsString()
  @MinLength(3)
  loginId: string;

  @ApiProperty({ description: 'Password', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Team ID', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  teamId?: number;

  @ApiProperty({ description: 'User code', example: 'USR001', required: false })
  @IsOptional()
  @IsString()
  userCode?: string;

  @ApiProperty({
    description: 'OAuth provider',
    example: 'google',
    required: false,
  })
  @IsOptional()
  @IsString()
  oauthProvider?: string;

  @ApiProperty({
    description: 'OAuth provider ID',
    example: 'google_123',
    required: false,
  })
  @IsOptional()
  @IsString()
  oauthProviderId?: string;

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  profileImageUrl?: string;
}
