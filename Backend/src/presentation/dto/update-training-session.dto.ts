import { PartialType } from '@nestjs/swagger';
import { CreateTrainingSessionDto } from './create-training-session.dto';

export class UpdateTrainingSessionDto extends PartialType(
  CreateTrainingSessionDto,
) {}
