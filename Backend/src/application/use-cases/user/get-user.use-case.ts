import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';

export interface GetUserRequest {
  id: number;
}

export interface GetUserResponse {
  success: boolean;
  user?: User;
  error?: string;
}

@Injectable()
export class GetUserUseCase {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(request: GetUserRequest): Promise<GetUserResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: request.id },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
