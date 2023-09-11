import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { ConfigType } from '@nestjs/config';
import emailConfig from './config/emailConfig';

@Injectable()
export class SendEmailService {
  constructor(
    @Inject(emailConfig.KEY) private config: ConfigType<typeof emailConfig>,
  ) {
    sgMail.setApiKey(this.config.apiKey);
  }
  async sendEmail(to: string, subject: string, html: string) {
    const msg = {
      to: to,
      from: this.config.baseEmail,
      subject: subject,
      html: html,
    };
    try {
      await sgMail.send(msg);
    } catch (error) {
      throw new InternalServerErrorException('이메일 전송 실패');
    }
  }
}
