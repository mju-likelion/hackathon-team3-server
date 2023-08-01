import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import authConfig from '../config/authConfig';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      load: [authConfig],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
