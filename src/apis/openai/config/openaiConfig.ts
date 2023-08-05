import { registerAs } from '@nestjs/config';

export default registerAs('openai', () => ({
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPEN_APIKEY,
}));
