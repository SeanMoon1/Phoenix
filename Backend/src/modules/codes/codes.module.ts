import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodesController } from './codes.controller';
import { CodesService } from './codes.service';
import { Code } from '../../database/entities/code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Code])],
  controllers: [CodesController],
  providers: [CodesService],
  exports: [CodesService],
})
export class CodesModule {}
