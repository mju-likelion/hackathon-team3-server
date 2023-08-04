import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/users.entity';
import { Learning } from './entities/learning.entity';
import { LearningsController } from './learnings.controller';
import { LearningsService } from './learnings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Learning, User])],
  controllers: [LearningsController],
  providers: [LearningsService],
})
export class LearningsModule {}
