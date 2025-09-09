import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingSession } from './entities/training-session.entity';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { UpdateTrainingSessionDto } from './dto/update-training-session.dto';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(TrainingSession)
    private trainingRepository: Repository<TrainingSession>,
  ) {}

  async create(createTrainingSessionDto: CreateTrainingSessionDto): Promise<TrainingSession> {
    const training = this.trainingRepository.create(createTrainingSessionDto);
    return this.trainingRepository.save(training);
  }

  async findAll(): Promise<TrainingSession[]> {
    return this.trainingRepository.find();
  }

  async findOne(id: number): Promise<TrainingSession> {
    const training = await this.trainingRepository.findOne({ where: { id } });
    
    if (!training) {
      throw new NotFoundException(`ID ${id}에 해당하는 훈련 세션을 찾을 수 없습니다.`);
    }
    
    return training;
  }

  async update(id: number, updateTrainingSessionDto: UpdateTrainingSessionDto): Promise<TrainingSession> {
    const training = await this.findOne(id);
    Object.assign(training, updateTrainingSessionDto);
    return this.trainingRepository.save(training);
  }

  async remove(id: number): Promise<void> {
    const training = await this.findOne(id);
    await this.trainingRepository.remove(training);
  }
}

