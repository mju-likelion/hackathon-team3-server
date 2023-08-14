import {
  ConflictException,
  Injectable,
  NotFoundException,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { ONEDAY, Payload } from './jwt/jwt.payload';
import { JoinDto } from './dtos/join.dto';
import { LoginDto } from './dtos/login.dto';
import { PostJoinRes } from './dtos/join-response.dto';
import { PostLoginRes } from './dtos/login-response.dto';
import { LogoutResponseDto } from './dtos/logout-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async join(joinDto: JoinDto): Promise<PostJoinRes> {
    if (
      await this.usersRepository.findOne({
        where: { email: joinDto.email },
      })
    ) {
      throw new ConflictException('이미 존재하는 사용자 입니다.');
    }
    await this.usersRepository.save(this.usersRepository.create(joinDto));
    const postJoinRes: PostJoinRes = new PostJoinRes();
    postJoinRes.statusCode = 201;
    postJoinRes.message = 'join success';
    return postJoinRes;
  }

  async login(loginDto: LoginDto, response: Response) {
    const userData = await this.usersRepository.findOne({
      where: { email: loginDto.email },
      select: { id: true, email: true, password: true, nickname: true },
    });
    if (!userData || !(await userData.checkPassword(loginDto.password))) {
      throw !userData
        ? new NotFoundException('존재하지 않는 사용자입니다.')
        : new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    const payload: Payload = {
      sub: userData.id,
      email: userData.email,
      period: ONEDAY,
    };

    const sign = this.jwtService.sign(payload);
    response.cookie('jwt', sign, {
      domain: 'surfing-likelion.com',
      httpOnly: true,
      secure: true,
    });
    const postLoginRes: PostLoginRes = new PostLoginRes();
    postLoginRes.statusCode = 200;
    postLoginRes.message = 'login success';
    postLoginRes.nickname = userData.nickname;

    return response.json(postLoginRes);
  }

  logout(@Res() res: Response): LogoutResponseDto {
    res.clearCookie('jwt');
    const logoutResponseDto: LogoutResponseDto = new LogoutResponseDto();
    logoutResponseDto.statusCode = 200;
    logoutResponseDto.message = 'logout success';
    return logoutResponseDto;
  }
}
