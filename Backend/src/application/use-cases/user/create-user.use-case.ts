import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../interfaces/repositories';
import { User } from '../../../domain/entities/user.entity';

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  teamId?: number;
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
    user.password = request.password; // 실제로는 해시화 필요
    user.name = request.name;
    user.teamId = request.teamId;

    const createdUser = await this.userRepository.create(user);

    return {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      createdAt: createdUser.createdAt,
    };
  }
}
