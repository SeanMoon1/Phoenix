import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { TeamsService } from './teams.service';
import { LoginDto } from '../../presentation/dto/login.dto';
import { RegisterDto } from '../../presentation/dto/register.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private teamsService: TeamsService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userLevel: user.userLevel,
        currentTier: user.currentTier,
      },
    };
  }

  /**
   * 회원가입 (팀 코드 없이)
   * @param registerDto 회원가입 정보
   * @returns 생성된 사용자 정보
   */
  async register(registerDto: RegisterDto) {
    try {
      // 1. 비밀번호 해시화
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // 2. 사용자 생성 (팀 ID는 null로 설정)
      const user = await this.usersService.create({
        ...registerDto,
        teamId: null, // 팀 코드 없이 가입
        userCode: null, // 사용자 코드는 나중에 설정
        password: hashedPassword,
      });

      const { password, ...result } = user;
      return result;
    } catch (error) {
      throw error;
    }
  }
}
