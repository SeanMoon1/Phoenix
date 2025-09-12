import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../../presentation/dto/create-user.dto';
import { UpdateUserDto } from '../../presentation/dto/update-user.dto';
import { PasswordUtil } from '../../utils/password.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 이메일 중복 확인
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // loginId 중복 확인
    const existingLoginId = await this.usersRepository.findOne({
      where: { loginId: createUserDto.loginId },
    });
    if (existingLoginId) {
      throw new Error('User with this loginId already exists');
    }

    // 사용자 생성
    const user = new User();
    user.loginId = createUserDto.loginId;
    user.email = createUserDto.email;
    user.password = createUserDto.password || '';
    user.name = createUserDto.name;
    user.teamId = createUserDto.teamId || 1; // 임시로 기본 팀 ID 설정
    user.userCode = createUserDto.userCode || `USER${Date.now()}`; // 임시로 고유한 사용자 코드 생성
    user.oauthProvider = createUserDto.oauthProvider || null;
    user.oauthProviderId = createUserDto.oauthProviderId || null;
    user.profileImageUrl = createUserDto.profileImageUrl || null;
    user.useYn = createUserDto.useYn || 'Y';
    user.userLevel = createUserDto.userLevel || 1;
    user.userExp = createUserDto.userExp || 0;
    user.totalScore = createUserDto.totalScore || 0;
    user.completedScenarios = createUserDto.completedScenarios || 0;
    user.currentTier = createUserDto.currentTier || '초급자';
    user.levelProgress = createUserDto.levelProgress || 0.0;
    user.nextLevelExp = createUserDto.nextLevelExp || 100;
    user.isActive = createUserDto.isActive !== undefined ? createUserDto.isActive : true;

    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: [
        'id',
        'name',
        'email',
        'useYn',
        'userLevel',
        'userExp',
        'totalScore',
        'completedScenarios',
        'currentTier',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'name',
        'email',
        'useYn',
        'userLevel',
        'userExp',
        'totalScore',
        'completedScenarios',
        'currentTier',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException(
        `ID ${id}에 해당하는 사용자를 찾을 수 없습니다.`,
      );
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  /**
   * OAuth 제공자로 사용자 조회
   * @param provider OAuth 제공자 (google, kakao, naver 등)
   * @param providerId OAuth 제공자의 사용자 ID
   * @returns 사용자 정보
   */
  async findByOAuthProvider(
    provider: string,
    providerId: string,
  ): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        oauthProvider: provider,
        oauthProviderId: providerId,
        isActive: true,
      },
    });
  }

  /**
   * 로그인 ID로 사용자 조회
   * @param loginId 로그인 ID
   * @returns 사용자 정보
   */
  async findByLoginId(loginId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        loginId,
        isActive: true,
      },
    });
  }
}
