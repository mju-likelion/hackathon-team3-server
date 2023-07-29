import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { Chapter } from 'src/chapters/entities/chapter.entity';

/**
 * @description
 * 객관식 - MCQ (Multiple Choice Question)
 * 주관식 - SAQ (Short Answer Question)
 * 빈칸채우기 - FITB (Fill in the Blank)
 */
export enum QuestionType {
  MCQ = 'MCQ',
  SAQ = 'SAQ',
  FITB = 'FITB',
}

@Entity()
export class Problem {
  @PrimaryGeneratedColumn('uuid')
  id!: number;

  /**
   * @description
   * 예시 문제인지 아닌지 구분
   */
  @Column()
  @IsBoolean()
  is_example!: boolean;

  @ManyToOne((type) => Chapter, (chapter) => chapter.problems, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  chapter?: Chapter;

  @Column({ type: 'enum', enum: QuestionType })
  @IsEnum(QuestionType)
  type!: QuestionType;

  /**
   * @description
   * 문제의 내용 - 문제와 문제에 필요한 정보를 담고 있음
   *
   * @example
   * case 1: 객관식
   * “문제:멋쟁이 사자처럼의 대표 색깔은?보기:검정색,노란색,파란색,빨간색"
   *
   * case 2: 주관식
   * “문제:멋쟁이 사자처럼의 대표 색깔은?"
   *
   * case 3: 빈칸
   * “문제:멋쟁이 사자처럼의 대표 색깔은 @@@이다."
   */
  @Column({
    nullable: false,
  })
  @IsString()
  content!: string;

  /**
   * @description
   * 문제의 정답(문자열로 주어짐)
   *
   * @example
   * case 1: 객관식
   * "1"
   *
   * case 2: 주관식
   * "검정색"
   *
   * case 3: 빈칸
   * "검정색"
   */
  @Column({
    nullable: false,
  })
  @IsString()
  answer!: string;
}
