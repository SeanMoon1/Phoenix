import { PartialType } from '@nestjs/swagger';
import { CreateScenarioDto } from './create-scenario.dto';

export class UpdateScenarioDto extends PartialType(CreateScenarioDto) {}
