import { Module } from '@nestjs/common';
import { CommonService } from './common.service.js';
import { CommonController } from './common.controller.js';

@Module({
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
