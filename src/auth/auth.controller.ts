import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JoinDto } from './dto/Join.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/join')
  join(@Body() joinDto: JoinDto) {
    return this.authService.join(joinDto);
  }
}
