import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsString } from 'class-validator';
import { Problem } from 'src/problems/entities/problem.entity';
import { Learning } from 'src/learnings/entities/learning.entity';

@Entity()
export class Chapter {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @IsString()
  title!: string;

  @Column({ nullable: true })
  @IsString()
  help_message?: string;

  @OneToMany((type) => Problem, (problem) => problem.chapter, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  problems?: Problem[];

  @ManyToOne((type) => Learning, (learning) => learning.chapters, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  learning?: Learning;
}
