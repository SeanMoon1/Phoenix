import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../../presentation/dto/create-user.dto';
import { UpdateUserDto } from '../../presentation/dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
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
