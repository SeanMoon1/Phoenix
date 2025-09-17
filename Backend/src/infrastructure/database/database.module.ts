import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';
import { Scenario } from '../../domain/entities/scenario.entity';
import { TrainingSession } from '../../domain/entities/training-session.entity';
import { TrainingResult } from '../../domain/entities/training-result.entity';
import { UserScenarioStats } from '../../domain/entities/user-scenario-stats.entity';
import { Team } from '../../domain/entities/team.entity';
import { TrainingParticipant } from '../../domain/entities/training-participant.entity';
import { ScenarioScene } from '../../domain/entities/scenario-scene.entity';
import { ScenarioEvent } from '../../domain/entities/scenario-event.entity';
import { ChoiceOption } from '../../domain/entities/choice-option.entity';
import { UserChoiceLog } from '../../domain/entities/user-choice-log.entity';
import { UserProgress } from '../../domain/entities/user-progress.entity';
import { Achievement } from '../../domain/entities/achievement.entity';
import { UserLevelHistory } from '../../domain/entities/user-level-history.entity';
import { Inquiry } from '../../domain/entities/inquiry.entity';
import { Faq } from '../../domain/entities/faq.entity';

// Repository implementations (moved to AppModule)

@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class DatabaseModule {}
