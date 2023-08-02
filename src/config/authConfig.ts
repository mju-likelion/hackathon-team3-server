import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  JWT_SECRET: process.env.JWT_SECRET,
}));
