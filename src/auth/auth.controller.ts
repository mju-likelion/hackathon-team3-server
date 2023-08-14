import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JoinDto } from './dtos/join.dto';
import { LoginDto } from './dtos/login.dto';
import { Response } from 'express';
import { PostJoinRes } from './dtos/join-response.dto';
import { LogoutResponseDto } from './dtos/logout-response.dto';
import { JwtAuthGuard } from './jwt/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/join')
  async join(@Body() joinDto: JoinDto): Promise<PostJoinRes> {
    return this.authService.join(joinDto);
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto, @Res() response: Response) {
    return this.authService.login(loginDto, response);
  }
  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  logout(@Res({ passthrough: true }) res: Response): LogoutResponseDto {
    return this.authService.logout(res);
  }
}
