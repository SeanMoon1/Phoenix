import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProgressController } from './user-progress.controller';
import { UserProgressService } from './user-progress.service';
import { UserProgress } from '../../database/entities/user-progress.entity';
import { Achievement } from '../../database/entities/achievement.entity';
import { UserScenarioStats } from '../../database/entities/user-scenario-stats.entity';
import { UserLevelHistory } from '../../database/entities/user-level-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProgress,
      Achievement,
      UserScenarioStats,
      UserLevelHistory,
    ]),
  ],
  controllers: [UserProgressController],
  providers: [UserProgressService],
  exports: [UserProgressService],
})
export class UserProgressModule {}
