import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

type GenerateTypeOrmConfig = (env: NodeJS.ProcessEnv) => TypeOrmModuleOptions;

export const generateTypeOrmConfig: GenerateTypeOrmConfig = (env) => ({
  type: 'mysql',
  host: env.DATABASE_HOST,
  port: +env.DATABASE_PORT,
  username: env.DATABASE_USERNAME,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  synchronize: true,
  logging: process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'], // migration 수행할 파일
  cli: {
    migrationsDir: 'src/migrations', // migration 파일을 생성할 디렉토리
  },
  migrationsTableName: 'migrations', // migration 내용이 기록될 테이블명(default = migration)
});
