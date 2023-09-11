import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  baseEmail: process.env.SENDGRID_BASE_EMAIL,
  apiKey: process.env.SENDGRID_API_KEY,
  emailVerificationUrl: process.env.EMAIL_VERIFICATION_URL,
}));
