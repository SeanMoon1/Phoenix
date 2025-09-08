import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenariosController } from './scenarios.controller';
import { ScenariosService } from './scenarios.service';
import { Scenario } from './entities/scenario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Scenario])],
  controllers: [ScenariosController],
  providers: [ScenariosService],
  exports: [ScenariosService],
})
export class ScenariosModule {}

