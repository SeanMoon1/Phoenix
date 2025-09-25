import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { UserDomainService } from '../../domain/services/user-domain.service';
import { CreateUserUseCase } from '../use-cases/user/create-user.use-case';
import { GetUserUseCase } from '../use-cases/user/get-user.use-case';
import { UpdateUserUseCase } from '../use-cases/user/update-user.use-case';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userDomainService: UserDomainService,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  ) {}

  async createUser(data: {
    loginId: string;
    password: string;
    name: string;
    email: string;
    teamId?: number;
    userCode?: string;
    oauthProvider?: string;
    oauthProviderId?: string;
    profileImageUrl?: string;
  }) {
    return this.createUserUseCase.execute(data);
  }

  async getUser(id: number) {
    return this.getUserUseCase.execute({ id });
  }

  async updateUser(
    id: number,
    data: {
      name?: string;
      email?: string;
      profileImageUrl?: string;
      password?: string;
      teamId?: number;
    },
  ) {
    return this.updateUserUseCase.execute({ id, ...data });
  }

  async getAllUsers() {
    return this.userRepository.find();
  }

  async getUsersByTeam(teamId: number) {
    return this.userRepository.find({
      where: { teamId },
      relations: ['team'],
    });
  }

  async deleteUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    await this.userRepository.delete(id);
  }

  // AuthService에서 필요한 메서드들
  async create(data: any) {
    console.log('🔍 UsersService.create 호출됨:', { data });
    const result = await this.createUser(data);
    console.log('🔍 createUser 결과:', { result });
    console.log('🔍 반환할 user:', result?.user);
    return result.user;
  }

  async update(id: number, data: any) {
    const result = await this.updateUser(id, data);
    return result.user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByLoginId(loginId: string) {
    return this.userRepository.findOne({ where: { loginId } });
  }

  async findByOAuthProvider(provider: string, providerId: string) {
    return this.userRepository.findOne({
      where: {
        oauthProvider: provider,
        oauthProviderId: providerId,
      },
    });
  }
}
