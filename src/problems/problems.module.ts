import { Module } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { OpenaiModule } from '../apis/openai/openai.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/users.entity';
import { Problem } from './entities/problem.entity';
import { ProblemsController } from './problems.controller';
import { Chapter } from '../chapters/entities/chapter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Problem, User, Chapter]), OpenaiModule],
  controllers: [ProblemsController],
  providers: [ProblemsService],
  exports: [ProblemsService],
})
export class ProblemsModule {}
