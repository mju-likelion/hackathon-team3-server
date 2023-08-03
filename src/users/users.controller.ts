import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { EntityManager } from 'typeorm';
import { User } from './entities/users.entity';
import { AuthUser } from 'src/auth/auth-user.decorator';

@Controller('users')
export class UsersController {
  constructor() {}

  @UseGuards(JwtAuthGuard)
  @Get()
  me(@AuthUser() user: User) {
    return user;
  }
}
