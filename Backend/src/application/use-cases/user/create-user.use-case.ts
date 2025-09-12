import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../interfaces/repositories';
import { User } from '../../../domain/entities/user.entity';
import { PasswordUtil } from '../../../utils/password.util';

export interface CreateUserRequest {
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
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // 비즈니스 로직
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // 사용자 생성
    const user = new User();
    user.email = request.email;
    user.password = await PasswordUtil.hashPassword(request.password); // 비밀번호 해시화
    user.name = request.name;
    // teamId와 userCode는 선택사항 - 나중에 팀 참가 시 설정 가능
    user.teamId = request.teamId || null;
    user.userCode = request.userCode || null;

    const createdUser = await this.userRepository.create(user);

    return {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      createdAt: createdUser.createdAt,
    };
  }
}
