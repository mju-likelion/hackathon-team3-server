import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsNumber } from 'class-validator';
import { Chapter } from 'src/chapters/entities/chapter.entity';

@Entity()
export class Learning {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * @description
   * 0: 기초 학습
   * 1: 심화 학습
   */
  @Column()
  @IsNumber()
  type!: number;

  @OneToMany((type) => Chapter, (chapter) => chapter.learning, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  chapters?: Chapter[];
}
