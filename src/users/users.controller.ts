import { Body, Controller, Delete, Get, Patch, Res } from '@nestjs/common';
import { AuthUser } from '../auth/auth-user.decorator';
import { User, UserRole } from './entities/users.entity';
import { UsersService } from './users.service';
import { ModifyPasswordReq } from './dtos/modify-password.dto';
import { Response } from 'express';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { ResponseDto } from '../common/dtos/response/response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Auth(UserRole.ANY)
  @Get()
  profile(@AuthUser() user: User): ResponseDto {
    return new ResponseDto([
      {
        user: user,
      },
    ]);
  }

  @Auth(UserRole.ANY)
  @Delete()
  async deleteAccount(
    @AuthUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseDto> {
    return this.usersService.deleteAccount(user, res);
  }

  @Auth(UserRole.ANY)
  @Patch('password')
  async modifyPassword(
    @AuthUser() user: User,
    @Body() modifyPasswordRes: ModifyPasswordReq,
  ): Promise<ResponseDto> {
    return this.usersService.modifyPassword(user, modifyPasswordRes);
  }
}
