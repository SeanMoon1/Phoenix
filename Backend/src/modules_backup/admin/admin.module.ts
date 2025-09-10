import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from '../users/users.module';
import { TeamsModule } from '../teams/teams.module';
import { ScenariosModule } from '../scenarios/scenarios.module';
import { TrainingModule } from '../training/training.module';

@Module({
  imports: [UsersModule, TeamsModule, ScenariosModule, TrainingModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

