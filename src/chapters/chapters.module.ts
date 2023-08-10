import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChaptersController } from './chapters.controller';
import { ChaptersService } from './chapters.service';
import { User } from 'src/users/entities/users.entity';
import { Chapter } from './entities/chapter.entity';
import { Learning } from '../learnings/entities/learning.entity';
import { Problem } from '../problems/entities/problem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Chapter, Learning, Problem])],
  controllers: [ChaptersController],
  providers: [ChaptersService],
})
export class ChaptersModule {}
