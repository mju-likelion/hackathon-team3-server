import { Body, Controller, Delete, Get, Patch, Res } from '@nestjs/common';
import { AuthUser } from '../auth/auth-user.decorator';
import { User, UserRole } from './entities/users.entity';
import { UsersService } from './users.service';
import {
  ModifyPasswordReq,
  ModifyPasswordRes,
} from './dtos/modify-password.dto';
import { DeleteAccountRes } from './dtos/delete-account.dto';
import { ProfileRes } from './dtos/profile.dto';
import { Response } from 'express';
import { Auth } from '../common/decorator/auth/auth.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Auth(UserRole.ANY)
  @Get()
  profile(@AuthUser() user: User): ProfileRes {
    return {
      statusCode: 200,
      message: 'User profile successfully retrieved',
      user,
    };
  }

  @Auth(UserRole.ANY)
  @Delete()
  async deleteAccount(
    @AuthUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<DeleteAccountRes> {
    return this.usersService.deleteAccount(user, res);
  }

  @Auth(UserRole.ANY)
  @Patch('password')
  async modifyPassword(
    @AuthUser() user: User,
    @Body() modifyPasswordRes: ModifyPasswordReq,
  ): Promise<ModifyPasswordRes> {
    return this.usersService.modifyPassword(user, modifyPasswordRes);
  }
}
