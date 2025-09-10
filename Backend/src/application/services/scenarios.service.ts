import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scenario } from '../../domain/entities/scenario.entity';
import { CreateScenarioDto } from '../../presentation/dto/create-scenario.dto';
import { UpdateScenarioDto } from '../../presentation/dto/update-scenario.dto';

@Injectable()
export class ScenariosService {
  constructor(
    @InjectRepository(Scenario)
    private scenariosRepository: Repository<Scenario>,
  ) {}

  async create(createScenarioDto: CreateScenarioDto): Promise<Scenario> {
    const scenario = this.scenariosRepository.create(createScenarioDto);
    return this.scenariosRepository.save(scenario);
  }

  async findAll(): Promise<Scenario[]> {
    return this.scenariosRepository.find();
  }

  async findOne(id: number): Promise<Scenario> {
    const scenario = await this.scenariosRepository.findOne({ where: { id } });

    if (!scenario) {
      throw new NotFoundException(
        `ID ${id}에 해당하는 시나리오를 찾을 수 없습니다.`,
      );
    }

    return scenario;
  }

  async update(
    id: number,
    updateScenarioDto: UpdateScenarioDto,
  ): Promise<Scenario> {
    const scenario = await this.findOne(id);
    Object.assign(scenario, updateScenarioDto);
    return this.scenariosRepository.save(scenario);
  }

  async remove(id: number): Promise<void> {
    const scenario = await this.findOne(id);
    await this.scenariosRepository.remove(scenario);
  }
}
