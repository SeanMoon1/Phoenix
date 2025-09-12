import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../../presentation/dto/create-user.dto';
import { UpdateUserDto } from '../../presentation/dto/update-user.dto';
import { CreateUserUseCase } from '../use-cases/user/create-user.use-case';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private createUserUseCase: CreateUserUseCase,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // UseCase를 사용하여 사용자 생성 (비즈니스 로직 포함)
    const result = await this.createUserUseCase.execute({
      email: createUserDto.email,
      password: createUserDto.password,
      name: createUserDto.name,
      teamId: createUserDto.teamId,
      userCode: createUserDto.userCode,
    });

    // UseCase 결과를 User 엔티티로 변환하여 반환
    const user = await this.usersRepository.findOne({
      where: { id: result.id },
    });
    if (!user) {
      throw new Error('사용자 생성 후 조회 실패');
    }
    return user;
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
