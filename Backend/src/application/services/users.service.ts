import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserDomainService } from '../../domain/services/user-domain.service';
import { CreateUserUseCase } from '../use-cases/user/create-user.use-case';
import { GetUserUseCase } from '../use-cases/user/get-user.use-case';
import { UpdateUserUseCase } from '../use-cases/user/update-user.use-case';

@Injectable()
export class UsersService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
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
    },
  ) {
    return this.updateUserUseCase.execute({ id, ...data });
  }

  async getAllUsers() {
    return this.userRepository.findAll();
  }

  async deleteUser(id: number) {
    const userId = this.userRepository.findById({ id } as any);
    if (!userId) {
      throw new Error('User not found');
    }
    return this.userRepository.delete({ id } as any);
  }

  // AuthService에서 필요한 메서드들
  async create(data: any) {
    const result = await this.createUser(data);
    return result.user;
  }

  async update(id: number, data: any) {
    const result = await this.updateUser(id, data);
    return result.user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findByLoginId(loginId: string) {
    return this.userRepository.findByLoginId(loginId);
  }

  async findByOAuthProvider(provider: string, providerId: string) {
    return this.userRepository.findByOAuthProvider(provider, providerId);
  }
}
