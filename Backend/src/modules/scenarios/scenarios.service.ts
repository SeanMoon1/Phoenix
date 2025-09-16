import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scenario } from './entities/scenario.entity';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { UpdateScenarioDto } from './dto/update-scenario.dto';

@Injectable()
export class ScenariosService {
  constructor(
    @InjectRepository(Scenario)
    private scenariosRepository: Repository<Scenario>,
  ) {}

  async create(createScenarioDto: CreateScenarioDto): Promise<Scenario> {
    // 시나리오 코드가 없으면 자동 생성
    if (!createScenarioDto.scenarioCode) {
      createScenarioDto.scenarioCode = await this.generateScenarioCode(
        createScenarioDto.teamId,
        createScenarioDto.disasterType,
      );
    }

    const scenario = this.scenariosRepository.create(createScenarioDto);
    return this.scenariosRepository.save(scenario);
  }

  async findAll(): Promise<Scenario[]> {
    return this.scenariosRepository.find();
  }

  async findOne(id: number): Promise<Scenario> {
    const scenario = await this.scenariosRepository.findOne({ where: { id } });
    
    if (!scenario) {
      throw new NotFoundException(`ID ${id}에 해당하는 시나리오를 찾을 수 없습니다.`);
    }
    
    return scenario;
  }

  async update(id: number, updateScenarioDto: UpdateScenarioDto): Promise<Scenario> {
    const scenario = await this.findOne(id);
    Object.assign(scenario, updateScenarioDto);
    return this.scenariosRepository.save(scenario);
  }

  async remove(id: number): Promise<void> {
    const scenario = await this.findOne(id);
    await this.scenariosRepository.remove(scenario);
  }

  /**
   * 시나리오 코드 자동 생성 (RDS 호환)
   * @param teamId 팀 ID
   * @param disasterType 재난 유형
   * @returns 생성된 시나리오 코드
   */
  async generateScenarioCode(
    teamId: number,
    disasterType: string,
  ): Promise<string> {
    const typeCode = this.getDisasterTypeCode(disasterType);
    const nextNumber = await this.getNextScenarioNumber(teamId, typeCode);
    return `${typeCode}${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * 재난 유형별 코드 반환
   * @param disasterType 재난 유형
   * @returns 코드
   */
  private getDisasterTypeCode(disasterType: string): string {
    const typeMap = {
      fire: 'FIR',
      earthquake: 'EAR',
      emergency: 'EME',
      traffic: 'TRA',
      flood: 'FLO',
    };
    return typeMap[disasterType] || 'GEN';
  }

  /**
   * 다음 시나리오 번호 조회
   * @param teamId 팀 ID
   * @param typeCode 재난 유형 코드
   * @returns 다음 번호
   */
  private async getNextScenarioNumber(
    teamId: number,
    typeCode: string,
  ): Promise<number> {
    const queryBuilder = this.scenariosRepository
      .createQueryBuilder('scenario')
      .select('scenario.scenarioCode')
      .where('scenario.teamId = :teamId', { teamId })
      .andWhere('scenario.scenarioCode LIKE :pattern', {
        pattern: `${typeCode}%`,
      })
      .andWhere('scenario.isActive = :isActive', { isActive: true })
      .orderBy('scenario.scenarioCode', 'DESC')
      .limit(1);

    const lastScenario = await queryBuilder.getOne();

    if (!lastScenario) {
      return 1;
    }

    // 시나리오 코드에서 번호 추출 (예: FIR001 -> 1)
    const codeNumber = lastScenario.scenarioCode.substring(3);
    const number = parseInt(codeNumber, 10);

    return isNaN(number) ? 1 : number + 1;
  }
}

