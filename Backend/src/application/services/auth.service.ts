import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { TeamsService } from './teams.service';
import { RegisterDto } from '../../presentation/dto/register.dto';
import { OAuthRegisterDto } from '../../presentation/dto/oauth-register.dto';
import { PasswordUtil } from '../../utils/password.util';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private teamsService: TeamsService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginId: string, password: string): Promise<any> {
    console.log('🔍 validateUser 호출:', { loginId });
    const user = await this.usersService.findByLoginId(loginId);
    console.log('👤 사용자 조회 결과:', user ? '사용자 존재' : '사용자 없음');

    if (user) {
      console.log('🔐 비밀번호 검증 시작');
      const isPasswordValid = await PasswordUtil.comparePassword(
        password,
        user.password,
      );
      console.log('🔐 비밀번호 검증 결과:', isPasswordValid ? '성공' : '실패');

      if (isPasswordValid) {
        const { password: _, ...result } = user;
        console.log('✅ 로그인 성공');
        return result;
      }
    }
    console.log('❌ 로그인 실패');
    return null;
  }

  async login(user: any) {
    console.log('🔑 로그인 처리 시작:', { userId: user.id, email: user.email });

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    const response = {
      success: true,
      message: '로그인이 성공적으로 완료되었습니다.',
      data: {
        access_token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userLevel: user.userLevel,
          currentTier: user.currentTier,
        },
      },
    };

    console.log('✅ 로그인 응답 생성 완료:', {
      success: response.success,
      userId: user.id,
    });
    return response;
  }

  /**
   * 회원가입 (팀 코드 없이)
   * @param registerDto 회원가입 정보
   * @returns 생성된 사용자 정보
   */
  async register(registerDto: RegisterDto) {
    try {
      console.log('📝 회원가입 시작:', {
        loginId: registerDto.loginId,
        email: registerDto.email,
        name: registerDto.name,
      });

      // 1. 비밀번호 강도 검사 (길이 중심)
      const passwordStrength = PasswordUtil.getPasswordStrength(
        registerDto.password,
      );
      console.log('🔐 비밀번호 강도:', passwordStrength.score);

      if (passwordStrength.score < 4) {
        // 최소 점수 4 (6자 + 소문자 + 숫자)
        console.log('❌ 비밀번호 강도 부족');
        throw new BadRequestException({
          message: '비밀번호가 너무 약합니다.',
          feedback: passwordStrength.feedback,
        });
      }

      // 2. 비밀번호 해시화
      console.log('🔐 비밀번호 해시화 시작');
      const hashedPassword = await PasswordUtil.hashPassword(
        registerDto.password,
      );
      console.log('🔐 비밀번호 해시화 완료');

      // 3. 사용자 생성 (팀 ID는 기본값으로 설정)
      const user = await this.usersService.create({
        ...registerDto,
        //teamId: 1, // 기본 팀 ID로 설정
        userCode: `USER${Date.now()}`, // 고유한 사용자 코드 생성
        password: hashedPassword,
        // 일반 회원가입 시 OAuth 필드들을 명시적으로 null로 설정
        oauthProvider: null,
        oauthProviderId: null,
        profileImageUrl: null,
      });

      console.log('🔍 사용자 생성 결과:', { user });

      if (!user) {
        console.log('❌ 사용자 생성 실패: user가 undefined');
        throw new BadRequestException({
          message: '사용자 생성에 실패했습니다.',
          error: 'User creation failed',
        });
      }

      const { password: _, ...result } = user;
      return {
        success: true,
        message: '회원가입이 성공적으로 완료되었습니다.',
        data: result,
      };
    } catch (error) {
      console.error('❌ 회원가입 오류 상세:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      throw new BadRequestException({
        success: false,
        message: '회원가입 중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  }

  /**
   * OAuth 회원가입 및 로그인 (자동 사용자 ID 생성)
   * @param oauthRegisterDto OAuth 회원가입 정보
   * @returns JWT 토큰과 사용자 정보
   */
  async oauthRegisterAndLogin(oauthRegisterDto: OAuthRegisterDto) {
    try {
      console.log('🔄 OAuth 사용자 등록/로그인 시작:', {
        email: oauthRegisterDto.email,
        oauthProvider: oauthRegisterDto.oauthProvider,
        oauthProviderId: oauthRegisterDto.oauthProviderId,
      });

      // 입력 데이터 검증 (이메일, 이름, OAuth 정보 필수)
      if (
        !oauthRegisterDto.email ||
        !oauthRegisterDto.name ||
        !oauthRegisterDto.oauthProvider ||
        !oauthRegisterDto.oauthProviderId
      ) {
        console.log('❌ OAuth 입력 데이터 불완전:', {
          email: !!oauthRegisterDto.email,
          name: !!oauthRegisterDto.name,
          oauthProvider: !!oauthRegisterDto.oauthProvider,
          oauthProviderId: !!oauthRegisterDto.oauthProviderId,
        });
        throw new BadRequestException('OAuth 사용자 정보가 불완전합니다.');
      }

      // 1. 이미 존재하는 사용자인지 확인 (이메일 또는 OAuth 제공자 ID로)
      let user = await this.usersService.findByEmail(oauthRegisterDto.email);
      console.log('👤 이메일로 사용자 조회 결과:', user ? '존재' : '없음');

      if (!user) {
        // 2. OAuth 제공자 ID로도 확인
        user = await this.usersService.findByOAuthProvider(
          oauthRegisterDto.oauthProvider,
          oauthRegisterDto.oauthProviderId,
        );
        console.log(
          '👤 OAuth 제공자 ID로 사용자 조회 결과:',
          user ? '존재' : '없음',
        );
      }

      if (!user) {
        // 3. 새 사용자 생성 (자동으로 사용자 ID 생성)
        console.log('🆕 새 사용자 생성 시작');
        const autoGeneratedLoginId = await this.generateUniqueLoginId(
          oauthRegisterDto.email,
        );
        console.log('🆔 생성된 로그인 ID:', autoGeneratedLoginId);

        try {
          user = await this.usersService.create({
            loginId: autoGeneratedLoginId,
            name: oauthRegisterDto.name,
            email: oauthRegisterDto.email,
            password: '', // OAuth 사용자는 비밀번호 없음
            teamId: null, // 팀은 나중에 가입
            userCode: null, // 사용자 코드는 나중에 생성
            oauthProvider: oauthRegisterDto.oauthProvider,
            oauthProviderId: oauthRegisterDto.oauthProviderId,
          });
          console.log('✅ 새 사용자 생성 완료:', {
            userId: user.id,
            email: user.email,
          });
        } catch (createError) {
          console.error('❌ 사용자 생성 실패:', {
            message: createError.message,
            stack: createError.stack,
          });
          throw new BadRequestException(
            '사용자 생성에 실패했습니다: ' + createError.message,
          );
        }
      } else {
        // 4. 기존 사용자 정보 업데이트 (OAuth 정보 추가)
        console.log('🔄 기존 사용자 정보 업데이트 시작:', { userId: user.id });
        try {
          user.oauthProvider = oauthRegisterDto.oauthProvider;
          user.oauthProviderId = oauthRegisterDto.oauthProviderId;
          user = await this.usersService.update(user.id, user);
          console.log('✅ 기존 사용자 정보 업데이트 완료');
        } catch (updateError) {
          console.error('❌ 사용자 정보 업데이트 실패:', {
            message: updateError.message,
            stack: updateError.stack,
          });
          throw new BadRequestException(
            '사용자 정보 업데이트에 실패했습니다: ' + updateError.message,
          );
        }
      }

      // 5. JWT 토큰 생성 및 반환
      console.log('🔑 JWT 토큰 생성 시작:', {
        userId: user.id,
        email: user.email,
      });
      try {
        const payload = { email: user.email, sub: user.id };
        const accessToken = this.jwtService.sign(payload);
        console.log('🔑 JWT 토큰 생성 완료');

        const result = {
          access_token: accessToken,
          user: {
            id: user.id,
            teamId: user.teamId,
            userCode: user.userCode,
            loginId: user.loginId,
            email: user.email,
            name: user.name,
            useYn: user.useYn,
            userLevel: user.userLevel,
            userExp: user.userExp,
            totalScore: user.totalScore,
            completedScenarios: user.completedScenarios,
            currentTier: user.currentTier,
            levelProgress: user.levelProgress,
            nextLevelExp: user.nextLevelExp,
            isActive: user.isActive,
            oauthProvider: user.oauthProvider,
            profileImageUrl: user.profileImageUrl,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        };

        console.log('✅ OAuth 사용자 등록/로그인 완료:', {
          userId: result.user.id,
          hasToken: !!result.access_token,
        });

        return result;
      } catch (jwtError) {
        console.error('❌ JWT 토큰 생성 실패:', {
          message: jwtError.message,
          stack: jwtError.stack,
        });
        throw new BadRequestException(
          'JWT 토큰 생성에 실패했습니다: ' + jwtError.message,
        );
      }
    } catch (error) {
      console.error('❌ OAuth 사용자 등록/로그인 오류:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      throw error;
    }
  }

  /**
   * 로그인 ID 중복 확인
   * @param loginId 확인할 로그인 ID
   * @returns 중복 확인 결과
   */
  async checkLoginIdAvailability(loginId: string) {
    try {
      const existingUser = await this.usersService.findByLoginId(loginId);

      return {
        success: true,
        data: {
          available: !existingUser,
          message: existingUser
            ? '이미 사용 중인 로그인 ID입니다.'
            : '사용 가능한 로그인 ID입니다.',
        },
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        error: '로그인 ID 확인 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * 고유한 로그인 ID 생성
   * @param email 이메일 주소
   * @returns 고유한 로그인 ID
   */
  private async generateUniqueLoginId(email: string): Promise<string> {
    // 이메일에서 @ 앞부분을 기본값으로 사용
    const baseId = email.split('@')[0].toLowerCase();
    let loginId = baseId;
    let counter = 1;

    // 고유한 ID가 될 때까지 반복
    while (await this.usersService.findByLoginId(loginId)) {
      loginId = `${baseId}${counter}`;
      counter++;
    }

    return loginId;
  }
}
