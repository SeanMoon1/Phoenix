import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { UserDomainService } from '../../../domain/services/user-domain.service';

export interface UpdateUserRequest {
  id: number;
  name?: string;
  email?: string;
  profileImageUrl?: string;
  password?: string;
}

export interface UpdateUserResponse {
  success: boolean;
  user?: any;
  error?: string;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly userDomainService: UserDomainService,
  ) {}

  async execute(request: UpdateUserRequest): Promise<UpdateUserResponse> {
    try {
      // Find existing user
      const existingUser = await this.userRepository.findById(request.id);
      if (!existingUser) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Validate email uniqueness if email is being updated
      if (request.email && request.email !== existingUser.email) {
        const isEmailUnique = await this.userDomainService.isEmailUnique(
          request.email,
          request.id,
        );
        if (!isEmailUnique) {
          return {
            success: false,
            error: 'Email already exists',
          };
        }
      }

      // Update user
      const updatedUser = await this.userRepository.update(request.id, {
        name: request.name,
        email: request.email,
        profileImageUrl: request.profileImageUrl,
        password: request.password,
      });

      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to update user',
      };
    }
  }
}
