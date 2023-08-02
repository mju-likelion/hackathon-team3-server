import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JoinDto } from './dto/join.dto';
import authConfig from '../config/authConfig';
import { ConfigType } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async join(joinDto: JoinDto) {
    if (
      await this.usersRepository.findOne({
        where: { email: joinDto.email },
      })
    ) {
      throw new ConflictException('이미 존재하는 사용자 입니다.');
    }
    const newUser = this.usersRepository.create(joinDto);
    return await this.usersRepository.save(newUser);
  }

  async login(loginDto: LoginDto, response: Response) {
    const userData = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });
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
