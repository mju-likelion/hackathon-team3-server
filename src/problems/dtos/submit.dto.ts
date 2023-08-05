import { IsString } from 'class-validator';

export class SubmitDto {
  @IsString()
  answer!: string;
}
