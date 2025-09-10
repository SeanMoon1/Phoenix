import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TeamsService } from '../teams/teams.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
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
   * 팀 코드 기반 회원가입 (AWS 호스팅 환경 최적화)
   * @param registerDto 회원가입 정보 (팀 코드 포함)
   * @returns 생성된 사용자 정보
   */
  async register(registerDto: RegisterDto) {
    try {
      // 1. 팀 코드로 팀 조회 및 검증
      const team = await this.teamsService.findByTeamCode(registerDto.teamCode);

      // 2. 비밀번호 해시화
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // 3. 사용자 생성 (팀 코드를 팀 ID로 변환)
      const user = await this.usersService.create({
        ...registerDto,
        teamId: team.id, // 팀 코드에서 팀 ID로 변환
        password: hashedPassword,
      });

      const { password, ...result } = user;
      return {
        ...result,
        team: {
          id: team.id,
          name: team.name,
          teamCode: team.teamCode,
        },
      };
    } catch (error) {
      if (error.message.includes('팀 코드')) {
        throw new BadRequestException(
          '유효하지 않은 팀 코드입니다. 팀 관리자에게 문의하세요.',
        );
      }
      throw error;
    }
  }
}
