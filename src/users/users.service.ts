import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { Repository } from 'typeorm';
import { CreateDto } from './dto/create.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(creteDto: CreateDto) {
    if (await this.findOne(creteDto.email)) {
      throw new ConflictException('이미 존재하는 사용자 입니다.');
    }
    const newUser = this.usersRepository.create(creteDto);
    await newUser.hashPassword();
    return await this.usersRepository.save(newUser);
  }

  async findOne(email: string) {
    return await this.usersRepository.findOne({
      where: { email: email },
    });
  }
}
