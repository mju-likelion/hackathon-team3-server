import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthUser } from '../auth/auth-user.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { User } from './entities/users.entity';
import { UsersService } from './users.service';
import {
  ModifyPasswordReq,
  ModifyPasswordRes,
} from './dtos/modify-password.dto';
import { DeleteAccountRes } from './dtos/delete-account.dto';
import { ProfileRes } from './dtos/profile.dto';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  profile(@AuthUser() user: User): ProfileRes {
    return {
      statusCode: 200,
      message: 'User profile successfully retrieved',
      user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteAccount(
    @AuthUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<DeleteAccountRes> {
    return this.usersService.deleteAccount(user, res);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async modifyPassword(
    @AuthUser() user: User,
    @Body() modifyPasswordRes: ModifyPasswordReq,
  ): Promise<ModifyPasswordRes> {
    return this.usersService.modifyPassword(user, modifyPasswordRes);
  }
}
