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

  async validateUser(loginId: string, password: string): Promise<any> {
    const user = await this.usersService.findByLoginId(loginId);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };

    // 관리자 권한 확인
    const isAdmin = user.userLevel >= 100; // userLevel 100 이상을 관리자로 간주

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userLevel: user.userLevel,
        currentTier: user.currentTier,
        isAdmin: isAdmin,
        adminLevel: isAdmin ? 'ADMIN' : 'USER',
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

  /**
   * Google OAuth 로그인/회원가입
   * @param googleUser Google OAuth에서 받은 사용자 정보
   * @returns JWT 토큰과 사용자 정보
   */
  async googleLogin(googleUser: any) {
    try {
      // 1. 이메일로 기존 사용자 조회
      let user = await this.usersService.findByEmail(googleUser.email);

      if (!user) {
        // 2. 사용자가 없으면 기본 팀에 가입 (팀 코드: 'DEFAULT')
        const defaultTeam = await this.teamsService.findByTeamCode('DEFAULT');

        if (!defaultTeam) {
          throw new BadRequestException('기본 팀이 설정되지 않았습니다.');
        }

        // 3. Google 사용자 정보로 새 사용자 생성
        user = await this.usersService.create({
          email: googleUser.email,
          name: googleUser.name,
          password: '', // OAuth 사용자는 비밀번호 없음
          teamId: defaultTeam.id,
          userLevel: 1, // 기본 레벨
          currentTier: 1, // 기본 티어
        });
      }

      // 4. JWT 토큰 생성
      const payload = { email: user.email, sub: user.id };

      // 관리자 권한 확인
      const isAdmin = user.userLevel >= 100; // userLevel 100 이상을 관리자로 간주

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userLevel: user.userLevel,
          currentTier: user.currentTier,
          isAdmin: isAdmin,
          adminLevel: isAdmin ? 'ADMIN' : 'USER',
        },
      };
    } catch (error) {
      throw new BadRequestException(
        'Google 로그인 처리 중 오류가 발생했습니다.',
      );
    }
  }
}
