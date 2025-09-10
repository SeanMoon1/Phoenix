import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingResultsController } from './training-results.controller';
import { TrainingResultsService } from './training-results.service';
import { TrainingResult } from '../../database/entities/training-result.entity';
import { TrainingParticipant } from '../../database/entities/training-participant.entity';
import { UserChoiceLog } from '../../database/entities/user-choice-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainingResult,
      TrainingParticipant,
      UserChoiceLog,
    ]),
  ],
  controllers: [TrainingResultsController],
  providers: [TrainingResultsService],
  exports: [TrainingResultsService],
})
export class TrainingResultsModule {}
