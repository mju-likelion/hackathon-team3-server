import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';
import { ModifyPasswordReq } from './dtos/modify-password.dto';
import { Response } from 'express';
import { ResponseDto } from '../common/dtos/response/response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async modifyPassword(
    user: User,
    { oldPassword, password }: ModifyPasswordReq,
  ): Promise<ResponseDto> {
    const userWithPassword = await this.usersRepository.findOneOrFail({
      where: { id: user.id },
      select: { id: true, email: true, password: true },
    });
    if (password && oldPassword) {
      if (await userWithPassword?.checkPassword(oldPassword)) {
        if (await userWithPassword.checkPassword(password)) {
          throw new BadRequestException('same password.');
        } else {
          userWithPassword.password = password;
        }
      } else throw new UnauthorizedException('password is incorrect.');

      await this.usersRepository.save(userWithPassword);
    } else {
      throw new BadRequestException('password or oldPassword is empty.');
    }
    return new ResponseDto([{ id: user.id }]);
  }

  async deleteAccount(user: User, @Res() res: Response): Promise<ResponseDto> {
    const userInDb = await this.usersRepository.findOne({
      where: { id: user.id },
    });
    if (!userInDb) {
      throw new NotFoundException('user not found.');
    }
    const result = await this.usersRepository.remove(user);

    if (result) {
      res.clearCookie('jwt', {
        domain: 'surfing-likelion.com',
        httpOnly: true,
        secure: true,
      });
      return new ResponseDto([]);
    }
  }
}
