import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JoinDto } from './dto/Join.dto';
import authConfig from '../config/authConfig';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
  ) {}

  async join(joinDto: JoinDto) {
    return this.usersService.create(joinDto);
  }
}
