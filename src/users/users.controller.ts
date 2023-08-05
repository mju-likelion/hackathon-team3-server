import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  profile(@AuthUser() user: User): ProfileRes {
    console.log(user);
    return {
      statusCode: 200,
      message: 'User profile successfully retrieved',
      user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteAccount(@AuthUser() user: User): Promise<DeleteAccountRes> {
    console.log(user);
    return this.usersService.deleteAccount(user);
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
