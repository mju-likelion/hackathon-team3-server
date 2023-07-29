import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ProblemsModule } from './problems/problems.module';
import { ChaptersModule } from './chapters/chapters.module';
import { LearningsModule } from './learnings/learnings.module';

@Module({
  imports: [UsersModule, ProblemsModule, ChaptersModule, LearningsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
