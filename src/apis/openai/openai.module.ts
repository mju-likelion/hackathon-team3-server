import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { ConfigModule } from '@nestjs/config';
import openaiConfig from './config/openaiConfig';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [openaiConfig],
    }),
  ],
  providers: [OpenaiService],
  exports: [OpenaiService],
})
export class OpenaiModule {}
