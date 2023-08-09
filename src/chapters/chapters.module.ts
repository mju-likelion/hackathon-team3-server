import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChaptersController } from './chapters.controller';
import { ChaptersService } from './chapters.service';
import { User } from 'src/users/entities/users.entity';
import { Chapter } from './entities/chapter.entity';
import { Learning } from '../learnings/entities/learning.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Chapter, Learning])],
  controllers: [ChaptersController],
  providers: [ChaptersService],
})
export class ChaptersModule {}
