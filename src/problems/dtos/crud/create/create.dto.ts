import { IsEnum, IsString } from 'class-validator';
import { QuestionType } from '../../../entities/problem.entity';

export class CreateDto {
  chapterId?: string;

  @IsEnum(QuestionType)
  type!: QuestionType;

  @IsString()
  scenario!: string;

  @IsString()
  content!: string;

  @IsString()
  answer!: string;

  answerOptions?: string;
}
