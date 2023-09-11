import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
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
import { EmailService } from '../email/email.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { EmailVerificationResponseDto } from './dtos/email-verification-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async join(joinDto: JoinDto): Promise<PostJoinRes> {
    if (
      await this.usersRepository.findOne({
        where: { email: joinDto.email },
      })
    ) {
      throw new ConflictException('이미 존재하는 사용자 입니다.');
    }

    const userInDto: User = this.usersRepository.create(joinDto);
    const verifyToken = uuidv4();
    await this.saveUserToRedis(verifyToken, userInDto);
    await this.emailService.sendEmail(
      joinDto.email,
      '이메일 인증',
      this.emailService.createVerificationEmail(verifyToken, '5'),
    );
    const postJoinRes: PostJoinRes = new PostJoinRes();
    postJoinRes.statusCode = 201;
    postJoinRes.message = 'email successfully sent';
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
    res.clearCookie('jwt', {
      domain: 'surfing-likelion.com',
      httpOnly: true,
      secure: true,
    });
    const logoutResponseDto: LogoutResponseDto = new LogoutResponseDto();
    logoutResponseDto.statusCode = 200;
    logoutResponseDto.message = 'logout success';
    return logoutResponseDto;
  }

  async saveUserToRedis(verifyToken: string, userData: User) {
    await this.cacheManager.set(verifyToken, userData, { ttl: 300 });
  }

  async emailVerification(verifyToken: string) {
    const userData = await this.cacheManager.get(verifyToken);
    if (!userData) {
      throw new NotFoundException('verifyToken not found.');
    }
    await this.usersRepository.save(this.usersRepository.create(userData));
    const emailVerificationResponseDto: EmailVerificationResponseDto =
      new EmailVerificationResponseDto();
    emailVerificationResponseDto.statusCode = 201;
    emailVerificationResponseDto.message = 'user successfully created';
    return emailVerificationResponseDto;
  }
}
