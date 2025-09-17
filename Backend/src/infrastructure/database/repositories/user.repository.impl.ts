import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findByLoginId(loginId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { loginId },
    });
  }

  async findByOAuthProvider(
    provider: string,
    providerId: string,
  ): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        oauthProvider: provider,
        oauthProviderId: providerId,
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async create(user: Partial<User>): Promise<User> {
    console.log('🔍 TypeOrmUserRepository.create 호출됨:', { user });
    try {
      const newUser = this.userRepository.create(user);
      console.log('🔍 생성된 엔티티:', { newUser });
      const savedUser = await this.userRepository.save(newUser);
      console.log('🔍 저장된 사용자:', { savedUser });
      return savedUser;
    } catch (error) {
      console.error('❌ TypeOrmUserRepository.create 오류:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      throw error;
    }
  }

  async update(id: number, user: Partial<User>): Promise<User> {
    await this.userRepository.update(id, user);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
