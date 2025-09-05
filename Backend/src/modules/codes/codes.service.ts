import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Code } from '../../database/entities/code.entity';
import { CommonService } from '../common/common.service';

@Injectable()
export class CodesService {
  constructor(
    @InjectRepository(Code)
    private codeRepository: Repository<Code>,
    private commonService: CommonService,
  ) {}

  async createCode(data: Partial<Code>): Promise<Code> {
    const code = this.codeRepository.create(data);
    return this.codeRepository.save(code);
  }

  async getCodesByClass(codeClass: string, teamId?: number): Promise<Code[]> {
    const whereCondition: any = { codeClass, useYn: 'Y', isActive: true };

    if (teamId !== undefined) {
      whereCondition.teamId = teamId;
    }

    return this.codeRepository.find({
      where: whereCondition,
      relations: ['team'],
      order: { codeOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async getSystemCodes(): Promise<Code[]> {
    return this.codeRepository.find({
      where: { teamId: null, useYn: 'Y', isActive: true },
      order: { codeClass: 'ASC', codeOrder: 'ASC' },
    });
  }

  async getTeamCodes(teamId: number): Promise<Code[]> {
    return this.codeRepository.find({
      where: { teamId, useYn: 'Y', isActive: true },
      relations: ['team'],
      order: { codeClass: 'ASC', codeOrder: 'ASC' },
    });
  }

  async updateCode(codeId: number, data: Partial<Code>): Promise<Code> {
    const code = await this.codeRepository.findOne({
      where: { id: codeId },
    });

    if (!code) {
      throw new Error('코드를 찾을 수 없습니다.');
    }

    Object.assign(code, data);
    return this.codeRepository.save(code);
  }

  async deleteCode(codeId: number): Promise<void> {
    await this.codeRepository.update(codeId, {
      isActive: false,
      deletedAt: new Date(),
    });
  }

  async getCodeByValue(
    codeClass: string,
    codeValue: string,
    teamId?: number,
  ): Promise<Code> {
    const whereCondition: any = {
      codeClass,
      codeValue,
      useYn: 'Y',
      isActive: true,
    };

    if (teamId !== undefined) {
      whereCondition.teamId = teamId;
    }

    return this.codeRepository.findOne({
      where: whereCondition,
      relations: ['team'],
    });
  }

  // 코드 그룹별 조회
  async getDisasterTypes(teamId?: number): Promise<Code[]> {
    return this.getCodesByClass('DISASTER_TYPE', teamId);
  }

  async getRiskLevels(teamId?: number): Promise<Code[]> {
    return this.getCodesByClass('RISK_LEVEL', teamId);
  }

  async getEventTypes(teamId?: number): Promise<Code[]> {
    return this.getCodesByClass('EVENT_TYPE', teamId);
  }

  async getInquiryCategories(teamId?: number): Promise<Code[]> {
    return this.getCodesByClass('INQUIRY_CATEGORY', teamId);
  }

  async getFaqCategories(teamId?: number): Promise<Code[]> {
    return this.getCodesByClass('FAQ_CATEGORY', teamId);
  }
}
