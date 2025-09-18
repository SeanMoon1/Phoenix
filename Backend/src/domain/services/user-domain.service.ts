import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';

@Injectable()
export class UserDomainService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async validateUserExists(id: number): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    return user !== null;
  }

  async validateEmailUnique(
    email: string,
    excludeUserId?: number,
  ): Promise<boolean> {
    const existingUser = await this.userRepository.findByEmail(email);

    if (!existingUser) {
      return true;
    }

    if (excludeUserId && existingUser.id === excludeUserId) {
      return true;
    }

    return false;
  }

  async validateLoginIdUnique(
    loginId: string,
    excludeUserId?: number,
  ): Promise<boolean> {
    const existingUser = await this.userRepository.findByLoginId(loginId);

    if (!existingUser) {
      return true;
    }

    if (excludeUserId && existingUser.id === excludeUserId) {
      return true;
    }

    return false;
  }

  async calculateUserRanking(userId: number): Promise<number> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const allUsers = await this.userRepository.findAll();
    const sortedUsers = allUsers.sort((a, b) => b.totalScore - a.totalScore);

    return sortedUsers.findIndex((u) => u.id === userId) + 1;
  }

  async getUsersByLevelRange(
    minLevel: number,
    maxLevel: number,
  ): Promise<User[]> {
    const allUsers = await this.userRepository.findAll();
    return allUsers.filter(
      (user) => user.userLevel >= minLevel && user.userLevel <= maxLevel,
    );
  }

  async getTopUsersByScore(limit: number = 10): Promise<User[]> {
    const allUsers = await this.userRepository.findAll();
    return allUsers.sort((a, b) => b.totalScore - a.totalScore).slice(0, limit);
  }

  // AuthService에서 필요한 메서드들
  async isEmailUnique(email: string, excludeUserId?: number): Promise<boolean> {
    return this.validateEmailUnique(email, excludeUserId);
  }

  async isLoginIdUnique(
    loginId: string,
    excludeUserId?: number,
  ): Promise<boolean> {
    return this.validateLoginIdUnique(loginId, excludeUserId);
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getUserRank(userId: number): Promise<number> {
    return this.calculateUserRanking(userId);
  }
}
