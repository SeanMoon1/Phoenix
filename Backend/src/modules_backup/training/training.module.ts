import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';
import { TrainingSession } from './entities/training-session.entity';
import { TrainingParticipant } from '../../database/entities/training-participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingSession, TrainingParticipant])],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}
