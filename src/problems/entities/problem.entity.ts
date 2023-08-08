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
  id!: string;

  @ManyToOne((type) => Chapter, (chapter) => chapter.problems, {
    nullable: true,
  })
  chapter?: Chapter;

  @Column({ type: 'enum', enum: QuestionType })
  @IsEnum(QuestionType)
  type!: QuestionType;

  @Column()
  @IsString()
  scenario!: string;

  /**
   * @description
   * 문제의 내용 - 문제 정보를 담고 있음
   *
   * @example
   * case 1: 객관식
   * “멋쟁이 사자처럼의 대표 색깔은?"
   *
   * case 2: 주관식
   * “멋쟁이 사자처럼의 대표 색깔은?"
   *
   * case 3: 빈칸
   * “멋쟁이 사자처럼의 대표 색깔은 @@@이다."
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
   * "검정색"
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

  /**
   * @description
   * 객관식 보기(문자열로 주어짐)
   *
   * @example
   * 객관식 보기가 "검은색", "빨간색", "초록색" 이라면
   * answerOptions "검은색,빨간색,초록색" <- ',' 를 기준으로 split 하여 사용
   */
  @Column({
    nullable: true,
  })
  @IsString()
  answerOptions?: string | null;
}
