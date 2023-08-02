import { Body, Controller, Post, Res, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JoinDto } from './dto/join.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/join')
  join(@Body() joinDto: JoinDto) {
    return this.authService.join(joinDto);
  }

  @Post('/login')
  login(@Headers() loginDto: LoginDto, @Res() response: Response) {
    return this.authService.login(loginDto, response);
  }
}
