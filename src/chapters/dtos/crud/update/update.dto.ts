import { IsString } from 'class-validator';

export class UpdateDto {
  @IsString()
  title!: string;

  @IsString()
  helpMessage?: string;

  learningId?: string;
}
