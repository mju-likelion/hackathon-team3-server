import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

type GenerateTypeOrmConfig = (env: NodeJS.ProcessEnv) => TypeOrmModuleOptions;

export const generateTypeOrmConfig: GenerateTypeOrmConfig = (env) => ({
  type: 'mysql',
  host: env.DATABASE_HOST,
  port: +env.DATABASE_PORT,
  username: env.DATABASE_USERNAME,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  synchronize: false,
  logging: process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
});
