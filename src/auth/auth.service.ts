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
import { ONEDAY, Payload } from '../common/decorator/auth/jwt/jwt.payload';
import { JoinDto } from './dtos/join.dto';
import { LoginDto } from './dtos/login.dto';
import { EmailService } from '../email/email.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { ResponseDto } from '../common/dtos/response/response.dto';

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

  async join(joinDto: JoinDto): Promise<ResponseDto> {
    if (
      await this.usersRepository.findOne({
        where: { email: joinDto.email },
      })
    ) {
      throw new ConflictException('user already exists.');
    }

    const userInDto: User = this.usersRepository.create(joinDto);
    const verifyToken = uuidv4();
    await this.saveUserToRedis(verifyToken, userInDto);
    await this.emailService.sendEmail(
      joinDto.email,
      '이메일 인증',
      this.emailService.createVerificationEmail(verifyToken, '5'),
    );
    return new ResponseDto([
      { nickname: joinDto.nickname, email: joinDto.email },
    ]);
  }

  async login(loginDto: LoginDto, response: Response): Promise<ResponseDto> {
    const userData = await this.usersRepository.findOne({
      where: { email: loginDto.email },
      select: { id: true, email: true, password: true, nickname: true },
    });
    if (!userData) {
      throw new NotFoundException('user not found.');
    }
    if (!(await userData.checkPassword(loginDto.password))) {
      throw new UnauthorizedException('password is not correct.');
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
    return new ResponseDto([
      { nickname: userData.nickname, email: userData.email },
    ]);
  }

  logout(@Res() res: Response): ResponseDto {
    res.clearCookie('jwt', {
      domain: 'surfing-likelion.com',
      httpOnly: true,
      secure: true,
    });
    return new ResponseDto([]);
  }

  async saveUserToRedis(verifyToken: string, userData: User) {
    await this.cacheManager.set(verifyToken, userData, { ttl: 300 });
  }

  async emailVerification(verifyToken: string): Promise<ResponseDto> {
    const userData = await this.cacheManager.get(verifyToken);
    if (!userData) {
      throw new NotFoundException('verifyToken not found.');
    }
    await this.usersRepository.save(this.usersRepository.create(userData));
    return new ResponseDto([
      { nickname: userData.nickname, email: userData.email },
    ]);
  }
}
