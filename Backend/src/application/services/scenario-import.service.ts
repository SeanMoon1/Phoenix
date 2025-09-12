import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scenario } from '../../domain/entities/scenario.entity';

interface ScenarioJsonData {
  id?: number;
  teamId: number;
  scenarioCode: string;
  sceneId?: string;
  title: string;
  content: string;
  sceneScript: string;
  status: string;
  approvalStatus: string;
  createdAt: string;
  createdBy: number | string;
  order: number;
  disasterType: string;
  riskLevel: string;
  difficulty: string;
  options?: Array<{
    answerId: string;
    answer: string;
    reaction: string;
    nextId: string;
    points: {
      speed: number;
      accuracy: number;
    };
    exp: number;
  }>;
}

@Injectable()
export class ScenarioImportService {
  constructor(
    @InjectRepository(Scenario)
    private scenarioRepository: Repository<Scenario>,
  ) {}

  async importFromJson(jsonData: ScenarioJsonData[]): Promise<Scenario[]> {
    const importedScenarios: Scenario[] = [];

    for (const jsonScenario of jsonData) {
      // JSON 데이터를 Scenario 엔티티로 변환
      const scenario = this.scenarioRepository.create({
        teamId: jsonScenario.teamId,
        scenarioCode: jsonScenario.scenarioCode,
        title: jsonScenario.title,
        disasterType: jsonScenario.disasterType,
        description: jsonScenario.content, // content를 description으로 매핑
        riskLevel: jsonScenario.riskLevel,
        difficulty: jsonScenario.difficulty,
        approvalStatus: jsonScenario.approvalStatus,
        status: jsonScenario.status,
        createdBy:
          typeof jsonScenario.createdBy === 'string'
            ? 1
            : jsonScenario.createdBy,
        // JSON의 추가 데이터는 별도 필드에 저장
        imageUrl: null,
        videoUrl: null,
        occurrenceCondition: null,
        approvalComment: null,
        approvedAt: null,
        approvedBy: null,
      });

      const savedScenario = await this.scenarioRepository.save(scenario);
      importedScenarios.push(savedScenario);
    }

    return importedScenarios;
  }

  async exportToJson(scenarioIds: number[]): Promise<ScenarioJsonData[]> {
    const scenarios = await this.scenarioRepository
      .createQueryBuilder('scenario')
      .where('scenario.id IN (:...ids)', { ids: scenarioIds })
      .getMany();

    return scenarios.map((scenario) => ({
      id: scenario.id,
      teamId: scenario.teamId,
      scenarioCode: scenario.scenarioCode,
      title: scenario.title,
      content: scenario.description,
      sceneScript: scenario.description, // description을 sceneScript로 매핑
      status: scenario.status,
      approvalStatus: scenario.approvalStatus,
      createdAt: scenario.createdAt.toISOString(),
      createdBy: scenario.createdBy,
      order: scenario.id, // ID를 order로 사용
      disasterType: scenario.disasterType,
      riskLevel: scenario.riskLevel,
      difficulty: scenario.difficulty,
      options: [], // 옵션은 별도로 관리
    }));
  }

  async syncFromJsonFile(jsonData: ScenarioJsonData[]): Promise<{
    imported: number;
    updated: number;
    errors: string[];
  }> {
    const result = {
      imported: 0,
      updated: 0,
      errors: [] as string[],
    };

    for (const jsonScenario of jsonData) {
      try {
        // 기존 시나리오가 있는지 확인
        const existingScenario = await this.scenarioRepository.findOne({
          where: { scenarioCode: jsonScenario.scenarioCode },
        });

        if (existingScenario) {
          // 기존 시나리오 업데이트
          Object.assign(existingScenario, {
            title: jsonScenario.title,
            description: jsonScenario.content,
            disasterType: jsonScenario.disasterType,
            riskLevel: jsonScenario.riskLevel,
            difficulty: jsonScenario.difficulty,
            approvalStatus: jsonScenario.approvalStatus,
            status: jsonScenario.status,
          });
          await this.scenarioRepository.save(existingScenario);
          result.updated++;
        } else {
          // 새 시나리오 생성
          const scenario = this.scenarioRepository.create({
            teamId: jsonScenario.teamId,
            scenarioCode: jsonScenario.scenarioCode,
            title: jsonScenario.title,
            disasterType: jsonScenario.disasterType,
            description: jsonScenario.content,
            riskLevel: jsonScenario.riskLevel,
            difficulty: jsonScenario.difficulty,
            approvalStatus: jsonScenario.approvalStatus,
            status: jsonScenario.status,
            createdBy:
              typeof jsonScenario.createdBy === 'string'
                ? 1
                : jsonScenario.createdBy,
            imageUrl: null,
            videoUrl: null,
            occurrenceCondition: null,
            approvalComment: null,
            approvedAt: null,
            approvedBy: null,
          });
          await this.scenarioRepository.save(scenario);
          result.imported++;
        }
      } catch (error) {
        result.errors.push(
          `시나리오 ${jsonScenario.scenarioCode} 처리 실패: ${error.message}`,
        );
      }
    }

    return result;
  }
}
