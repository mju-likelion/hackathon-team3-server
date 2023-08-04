import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ProblemsModule } from './problems/problems.module';
import { ChaptersModule } from './chapters/chapters.module';
import { LearningsModule } from './learnings/learnings.module';
import { generateTypeOrmConfig } from './config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/validationSchema';
import { AuthModule } from './auth/auth.module';
import { OpenaiModule } from './apis/openai/openai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'dev'
          ? '.env.dev'
          : process.env.NODE_ENV === 'prod'
          ? '.env.prod'
          : '.env.test',
      validationSchema,
    }),
    TypeOrmModule.forRoot(generateTypeOrmConfig(process.env)),
    UsersModule,
    ProblemsModule,
    ChaptersModule,
    LearningsModule,
    AuthModule,
    OpenaiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
