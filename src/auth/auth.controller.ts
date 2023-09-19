import { Body, Controller, Post, Query, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JoinDto } from './dtos/join.dto';
import { LoginDto } from './dtos/login.dto';
import { Response } from 'express';
import { PostJoinRes } from './dtos/join-response.dto';
import { LogoutResponseDto } from './dtos/logout-response.dto';
import { JwtAuthGuard } from '../common/decorator/auth/jwt/jwt.guard';
import { EmailVerificationResponseDto } from './dtos/email-verification-response.dto';

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

  @Post('/email-verification')
  async emailVerification(
    @Query('verifyToken') verifyToken: string,
  ): Promise<EmailVerificationResponseDto> {
    return this.authService.emailVerification(verifyToken);
  }
}
