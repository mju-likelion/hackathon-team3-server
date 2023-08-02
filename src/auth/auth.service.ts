import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JoinDto } from './dto/join.dto';
import authConfig from '../config/authConfig';
import { ConfigType } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
  ) {}

  async join(joinDto: JoinDto) {
    return this.usersService.create(joinDto);
  }

  async login(loginDto: LoginDto, response: Response) {
    const userData = await this.usersService.findOne(loginDto.email);
    if (!userData || (await userData.checkPassword(loginDto.password))) {
      throw !userData
        ? new UnauthorizedException('비밀번호가 일치하지 않습니다.')
        : new NotFoundException('존재하지 않는 사용자입니다.');
    }

    const sign = jwt.sign({ id: userData.id }, this.config.JWT_SECRET, {
      expiresIn: '1d',
      audience: 'example.com',
      issuer: 'example.com',
    });
    response.cookie('jwt', sign, {
      httpOnly: true,
    });
    return response.send({
      message: 'login',
    });
  }

  isValidateJwtToken(userId: string, jwtString: string) {
    try {
      const payload = jwt.verify(jwtString, this.config.JWT_SECRET) as (
        | jwt.JwtPayload
        | string
      ) & { id: string };
      return userId === payload.id;
    } catch (e) {
      throw new ConflictException(e.message);
    }
  }
}
