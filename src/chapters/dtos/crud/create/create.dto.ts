import { PickType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';
import { Chapter } from 'src/chapters/entities/chapter.entity';

export class CreateDto extends PickType(Chapter, [
  'title',
  'helpMessage',
  'order',
]) {
  @IsString()
  learningId?: string;
}
