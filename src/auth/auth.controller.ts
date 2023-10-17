import {
  Body,
  Controller,
  HttpCode,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JoinDto } from './dtos/join.dto';
import { LoginDto } from './dtos/login.dto';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/decorator/auth/jwt/jwt.guard';
import { ResponseDto } from '../common/dtos/response/response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/join')
  async join(@Body() joinDto: JoinDto): Promise<ResponseDto> {
    return await this.authService.join(joinDto);
  }

  @Post('/login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseDto> {
    return await this.authService.login(loginDto, response);
  }
  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  logout(@Res({ passthrough: true }) res: Response): ResponseDto {
    return this.authService.logout(res);
  }

  @Post('/email-verification')
  async emailVerification(
    @Query('verifyToken') verifyToken: string,
  ): Promise<ResponseDto> {
    return this.authService.emailVerification(verifyToken);
  }
}
