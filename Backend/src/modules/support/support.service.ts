import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry } from '../../database/entities/inquiry.entity';
import { Faq } from '../../database/entities/faq.entity';
import { CommonService } from '../common/common.service';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(Inquiry)
    private inquiryRepository: Repository<Inquiry>,
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,
    private commonService: CommonService,
  ) {}

  // 문의사항 관련 메서드
  async createInquiry(data: Partial<Inquiry>): Promise<Inquiry> {
    const inquiryCode = this.commonService.generateCode('INQ');
    const inquiry = this.inquiryRepository.create({
      ...data,
      inquiryCode,
    });
    return this.inquiryRepository.save(inquiry);
  }

  async getInquiriesByUser(userId: number): Promise<Inquiry[]> {
    return this.inquiryRepository.find({
      where: { userId, isActive: true },
      relations: ['team', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getInquiriesByTeam(teamId: number): Promise<Inquiry[]> {
    return this.inquiryRepository.find({
      where: { teamId, isActive: true },
      relations: ['user', 'responder'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateInquiryStatus(
    inquiryId: number,
    status: string,
    adminResponse?: string,
    respondedBy?: number,
  ): Promise<Inquiry> {
    const inquiry = await this.inquiryRepository.findOne({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      throw new Error('문의사항을 찾을 수 없습니다.');
    }

    inquiry.status = status;
    if (adminResponse) {
      inquiry.adminResponse = adminResponse;
    }
    if (respondedBy) {
      inquiry.respondedBy = respondedBy;
      inquiry.respondedAt = new Date();
    }

    return this.inquiryRepository.save(inquiry);
  }

  // FAQ 관련 메서드
  async createFaq(data: Partial<Faq>): Promise<Faq> {
    const faqCode = this.commonService.generateCode('FAQ');
    const faq = this.faqRepository.create({
      ...data,
      faqCode,
    });
    return this.faqRepository.save(faq);
  }

  async getFaqsByTeam(teamId: number): Promise<Faq[]> {
    return this.faqRepository.find({
      where: { teamId, useYn: 'Y', isActive: true },
      relations: ['team'],
      order: { orderNum: 'ASC', createdAt: 'ASC' },
    });
  }

  async getFaqsByCategory(teamId: number, category: string): Promise<Faq[]> {
    return this.faqRepository.find({
      where: { teamId, category, useYn: 'Y', isActive: true },
      relations: ['team'],
      order: { orderNum: 'ASC' },
    });
  }

  async updateFaq(faqId: number, data: Partial<Faq>): Promise<Faq> {
    const faq = await this.faqRepository.findOne({
      where: { id: faqId },
    });

    if (!faq) {
      throw new Error('FAQ를 찾을 수 없습니다.');
    }

    Object.assign(faq, data);
    return this.faqRepository.save(faq);
  }

  async deleteFaq(faqId: number): Promise<void> {
    await this.faqRepository.update(faqId, {
      isActive: false,
      deletedAt: new Date(),
    });
  }
}
