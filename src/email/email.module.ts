import { Module } from '@nestjs/common';
import { SendEmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import emailConfig from './config/emailConfig';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [emailConfig],
    }),
  ],
  providers: [SendEmailService],
  exports: [SendEmailService],
})
export class EmailModule {}
