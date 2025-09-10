import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { Inquiry } from '../../database/entities/inquiry.entity';
import { Faq } from '../../database/entities/faq.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inquiry, Faq])],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
