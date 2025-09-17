import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { UserDomainService } from '../../../domain/services/user-domain.service';

export interface CreateUserRequest {
  loginId: string;
  password: string;
  name: string;
  email: string;
  teamId?: number;
  userCode?: string;
  oauthProvider?: string;
  oauthProviderId?: string;
  profileImageUrl?: string;
}

export interface CreateUserResponse {
  success: boolean;
  user?: any;
  error?: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly userDomainService: UserDomainService,
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      // Validate email uniqueness
      const existingUserByEmail = await this.userDomainService.isEmailUnique(
        request.email,
      );
      if (!existingUserByEmail) {
        return {
          success: false,
          error: 'Email already exists',
        };
      }

      // Validate login ID uniqueness
      const existingUserByLoginId =
        await this.userDomainService.isLoginIdUnique(request.loginId);
      if (!existingUserByLoginId) {
        return {
          success: false,
          error: 'Login ID already exists',
        };
      }

      // Create user
      const user = await this.userRepository.create({
        loginId: request.loginId,
        password: request.password,
        name: request.name,
        email: request.email,
        teamId: request.teamId,
        userCode: request.userCode,
        oauthProvider: request.oauthProvider,
        oauthProviderId: request.oauthProviderId,
        profileImageUrl: request.profileImageUrl,
        useYn: 'Y',
        userLevel: 1,
        userExp: 0,
        totalScore: 0,
        completedScenarios: 0,
        currentTier: '초급자',
        levelProgress: 0.0,
        nextLevelExp: 100,
        isActive: true,
      });

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to create user',
      };
    }
  }
}
