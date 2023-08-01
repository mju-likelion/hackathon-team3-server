import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  KEY: process.env.KEY,
  JWT_SECRET: process.env.JWT_SECRET,
}));
