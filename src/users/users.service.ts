import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';
import {
  ModifyPasswordReq,
  ModifyPasswordRes,
} from './dtos/modify-password.dto';
import { DeleteAccountRes } from './dtos/delete-account.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async modifyPassword(
    user: User,
    { oldPassword, password }: ModifyPasswordReq,
  ): Promise<ModifyPasswordRes> {
    try {
      const userWithPassword = await this.usersRepository.findOneOrFail({
        where: { id: user.id },
        select: { id: true, email: true, password: true },
      });

      if (password && oldPassword) {
        if (await userWithPassword?.checkPassword(oldPassword))
          userWithPassword.password = password;
        else throw new UnauthorizedException('The password is incorrect');

        await this.usersRepository.save(userWithPassword);
      } else {
        throw new BadRequestException('Please enter a password');
      }

      return {
        statusCode: 200,
        message: 'Password successfully modified',
      };
    } catch (e) {
      throw e;
    }
  }

  async deleteAccount(user: User): Promise<DeleteAccountRes> {
    const userInDb = await this.usersRepository.findOne({
      where: { id: user.id },
    });
    if (!userInDb) {
      throw new NotFoundException('User not found');
    }
    const result = await this.usersRepository.remove(user);

    if (result) {
      return {
        statusCode: 200,
        message: 'Account successfully deleted',
      };
    }
  }
}
