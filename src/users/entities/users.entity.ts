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
import { IsEmail, IsEnum, IsString, Matches } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { Chapter } from 'src/chapters/entities/chapter.entity';
import { Problem } from '../../problems/entities/problem.entity';

/**
 * @description
 * 일반 사용자 - USER
 * 관리자 - ADMIN
 * 모든 권한 - ANY
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  ANY = 'ANY',
}

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

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  @IsEnum(UserRole)
  role!: UserRole;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        throw new InternalServerErrorException('Failed to hash the password.');
      }
    }
  }

  async checkPassword(plainPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, this.password);
    } catch (e) {
      throw new InternalServerErrorException('Failed to compare the password.');
    }
  }
}
