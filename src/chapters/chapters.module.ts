import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChaptersController } from './chapters.controller';
import { ChaptersService } from './chapters.service';
import { User } from 'src/users/entities/users.entity';
import { Chapter } from './entities/chapter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Chapter])],
  controllers: [ChaptersController],
  providers: [ChaptersService],
})
export class ChaptersModule {}
