import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../domain/entities/user.entity';
import { TypeOrmUserRepository } from './user.repository.impl';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [TypeOrmUserRepository],
  exports: [TypeOrmUserRepository],
})
export class RepositoriesModule {}
