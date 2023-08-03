import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JoinDto } from './dto/join.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/join')
  async join(@Body() joinDto: JoinDto) {
    return this.authService.join(joinDto);
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto, @Res() response: Response) {
    return this.authService.login(loginDto, response);
  }
}
