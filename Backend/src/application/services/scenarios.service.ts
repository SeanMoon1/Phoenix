import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scenario } from '../../domain/entities/scenario.entity';
import { CreateScenarioDto } from '../../presentation/dto/create-scenario.dto';
import { UpdateScenarioDto } from '../../presentation/dto/update-scenario.dto';

@Injectable()
export class ScenariosService {
  constructor(
    @InjectRepository(Scenario)
    private readonly scenarioRepository: Repository<Scenario>,
  ) {}

  async create(createScenarioDto: CreateScenarioDto): Promise<Scenario> {
    // 시나리오 코드가 없으면 자동 생성
    const scenarioData = {
      ...createScenarioDto,
      scenarioCode:
        createScenarioDto.scenarioCode ||
        (await this.generateScenarioCode(
          createScenarioDto.teamId,
          createScenarioDto.disasterType || 'unknown',
        )),
    };

    // 코드 중복 확인
    const existingScenario = await this.scenarioRepository.findOne({
      where: { scenarioCode: scenarioData.scenarioCode },
    });
    if (existingScenario) {
      throw new Error('시나리오 코드가 이미 존재합니다.');
    }

    const newScenario = this.scenarioRepository.create(scenarioData);
    return this.scenarioRepository.save(newScenario);
  }

  async findAll(): Promise<Scenario[]> {
    return this.scenarioRepository.find();
  }

  async findOne(id: number): Promise<Scenario> {
    return this.scenarioRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateScenarioDto: UpdateScenarioDto,
  ): Promise<Scenario> {
    await this.scenarioRepository.update(id, updateScenarioDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.scenarioRepository.delete(id);
  }

  async findByTeamId(teamId: number): Promise<Scenario[]> {
    return this.scenarioRepository.find({ where: { teamId } });
  }

  async findByDisasterType(disasterType: string): Promise<Scenario[]> {
    return this.scenarioRepository.find({ where: { disasterType } });
  }

  async findByApprovalStatus(status: string): Promise<Scenario[]> {
    return this.scenarioRepository.find({ where: { approvalStatus: status } });
  }

  /**
   * 시나리오 코드 자동 생성
   * @param teamId 팀 ID
   * @param disasterType 재난 유형
   * @returns 생성된 시나리오 코드
   */
  private async generateScenarioCode(
    teamId: number | null | undefined,
    disasterType: string,
  ): Promise<string> {
    // 재난 유형별 코드 생성
    const typeCode = this.getDisasterTypeCode(disasterType);

    // 다음 시퀀스 번호 조회
    const existingScenarios = teamId
      ? await this.scenarioRepository.find({ where: { teamId } })
      : await this.scenarioRepository.find();
    const typeScenarios = existingScenarios.filter(
      (s) => s.scenarioCode?.startsWith(typeCode) && s.isActive,
    );

    const nextNumber = typeScenarios.length + 1;
    return `${typeCode}${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * 재난 유형별 코드 반환
   * @param disasterType 재난 유형
   * @returns 3자리 코드
   */
  private getDisasterTypeCode(disasterType: string): string {
    const typeMap: { [key: string]: string } = {
      fire: 'FIR',
      earthquake: 'EAR',
      emergency: 'EME',
      traffic: 'TRA',
      flood: 'FLO',
    };
    return typeMap[disasterType.toLowerCase()] || 'GEN';
  }

  async syncFromJson(
    jsonData: any,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // JSON 데이터를 시나리오 형식으로 변환
      const scenarios = Array.isArray(jsonData) ? jsonData : [jsonData];

      let successCount = 0;
      let failCount = 0;

      for (const item of scenarios) {
        try {
          // JSON 데이터를 데이터베이스 스키마에 맞게 변환
          const scenarioData = {
            scenarioCode:
              item.scenarioCode ||
              `SCENARIO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: item.title || '제목 없음',
            disasterType: item.disasterType || 'unknown',
            description: item.description || item.content || '설명 없음',
            riskLevel: item.riskLevel || 'MEDIUM',
            difficulty: item.difficulty || 'easy',
            approvalStatus: 'APPROVED',
            status: 'ACTIVE',
            createdBy: 1, // 기본 생성자
            teamId: 1, // 기본 팀 ID
          };

          // 기존 시나리오가 있는지 확인
          const existingScenario = await this.scenarioRepository.findOne({
            where: { scenarioCode: scenarioData.scenarioCode },
          });

          if (existingScenario) {
            // 기존 시나리오 업데이트
            await this.scenarioRepository.update(
              existingScenario.id,
              scenarioData,
            );
            successCount++;
          } else {
            // 새 시나리오 생성
            const newScenario = this.scenarioRepository.create(scenarioData);
            await this.scenarioRepository.save(newScenario);
            successCount++;
          }
        } catch (error) {
          console.error('시나리오 동기화 실패:', error);
          failCount++;
        }
      }

      return {
        success: successCount > 0,
        message: `${successCount}개 시나리오가 동기화되었습니다.${failCount > 0 ? ` (${failCount}개 실패)` : ''}`,
      };
    } catch (error) {
      console.error('시나리오 동기화 중 오류:', error);
      return {
        success: false,
        message: '시나리오 동기화 중 오류가 발생했습니다.',
      };
    }
  }
}
