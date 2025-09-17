import { Injectable, Inject } from '@nestjs/common';
import { ScenarioRepository } from '../../domain/repositories/scenario.repository';
import { Scenario } from '../../domain/entities/scenario.entity';
import { CreateScenarioDto } from '../../presentation/dto/create-scenario.dto';
import { UpdateScenarioDto } from '../../presentation/dto/update-scenario.dto';

@Injectable()
export class ScenariosService {
  constructor(
    @Inject('ScenarioRepository')
    private readonly scenarioRepository: ScenarioRepository,
  ) {}

  async create(createScenarioDto: CreateScenarioDto): Promise<Scenario> {
    return this.scenarioRepository.create(createScenarioDto);
  }

  async findAll(): Promise<Scenario[]> {
    return this.scenarioRepository.findAll();
  }

  async findOne(id: number): Promise<Scenario> {
    return this.scenarioRepository.findById(id);
  }

  async update(
    id: number,
    updateScenarioDto: UpdateScenarioDto,
  ): Promise<Scenario> {
    return this.scenarioRepository.update(id, updateScenarioDto);
  }

  async remove(id: number): Promise<void> {
    return this.scenarioRepository.delete(id);
  }

  async findByTeamId(teamId: number): Promise<Scenario[]> {
    return this.scenarioRepository.findByTeamId(teamId);
  }

  async findByDisasterType(disasterType: string): Promise<Scenario[]> {
    return this.scenarioRepository.findByDisasterType(disasterType);
  }

  async findByApprovalStatus(status: string): Promise<Scenario[]> {
    return this.scenarioRepository.findByApprovalStatus(status);
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
          const existingScenario =
            await this.scenarioRepository.findByScenarioCode(
              scenarioData.scenarioCode,
            );

          if (existingScenario) {
            // 기존 시나리오 업데이트
            await this.scenarioRepository.update(
              existingScenario.id,
              scenarioData,
            );
            successCount++;
          } else {
            // 새 시나리오 생성
            await this.scenarioRepository.create(scenarioData);
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
