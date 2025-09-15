import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';
import { PasswordUtil } from '../../../utils/password.util';

export interface CreateUserRequest {
  loginId: string;
  email: string;
  password: string;
  name: string;
  teamId?: number;
  userCode?: string;
}

export interface CreateUserResponse {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // 비즈니스 로직
    const existingUser = await this.userRepository.findOne({
      where: { email: request.email },
    });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // loginId 중복 확인
    const existingLoginId = await this.userRepository.findOne({
      where: { loginId: request.loginId },
    });
    if (existingLoginId) {
      throw new Error('User with this loginId already exists');
    }

    // 사용자 생성
    const user = new User();
    user.loginId = request.loginId;
    user.email = request.email;
    user.password = await PasswordUtil.hashPassword(request.password); // 비밀번호 해시화
    user.name = request.name;
    // teamId와 userCode는 선택사항 - 나중에 팀 참가 시 설정 가능
    user.teamId = request.teamId || null;
    user.userCode = request.userCode || null;

    const createdUser = await this.userRepository.save(user);

    return {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      createdAt: createdUser.createdAt,
    };
  }
}
