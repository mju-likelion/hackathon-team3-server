import { IsString } from 'class-validator';

export class CreateDto {
  @IsString()
  title!: string;

  @IsString()
  helpMessage: string;

  learningId?: string;
}
