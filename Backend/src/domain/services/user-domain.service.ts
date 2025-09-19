import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserDomainService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validateUserExists(id: number): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user !== null;
  }

  async validateEmailUnique(
    email: string,
    excludeUserId?: number,
  ): Promise<boolean> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

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
    const existingUser = await this.userRepository.findOne({
      where: { loginId },
    });

    if (!existingUser) {
      return true;
    }

    if (excludeUserId && existingUser.id === excludeUserId) {
      return true;
    }

    return false;
  }

  async calculateUserRanking(userId: number): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const allUsers = await this.userRepository.find();
    const sortedUsers = allUsers.sort((a, b) => b.totalScore - a.totalScore);

    return sortedUsers.findIndex((u) => u.id === userId) + 1;
  }

  async getUsersByLevelRange(
    minLevel: number,
    maxLevel: number,
  ): Promise<User[]> {
    const allUsers = await this.userRepository.find();
    return allUsers.filter(
      (user) => user.userLevel >= minLevel && user.userLevel <= maxLevel,
    );
  }

  async getTopUsersByScore(limit: number = 10): Promise<User[]> {
    const allUsers = await this.userRepository.find();
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
    return this.userRepository.findOne({ where: { id } });
  }

  async getUserRank(userId: number): Promise<number> {
    return this.calculateUserRanking(userId);
  }
}
