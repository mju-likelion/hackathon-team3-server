import { InternalServerErrorException } from '@nestjs/common';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsEmail, IsString, Matches } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { Chapter } from 'src/chapters/entities/chapter.entity';
import { Problem } from '../../problems/entities/problem.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @IsString()
  nickname!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column({ select: false })
  @IsString()
  @Matches(/^(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Password must be at least 8 characters(en) long, contain 1 number',
  })
  password!: string;

  @ManyToMany(() => Chapter)
  @JoinTable()
  completedChapters?: Chapter[];

  @ManyToMany(() => Problem)
  @JoinTable()
  completedProblems?: Problem[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        throw new InternalServerErrorException(
          '비밀번호를 암호화하는데 실패했습니다.',
        );
      }
    }
  }

  async checkPassword(plainPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, this.password);
    } catch (e) {
      throw new InternalServerErrorException(
        '비밀번호를 확인하는데 실패했습니다.',
      );
    }
  }
}
