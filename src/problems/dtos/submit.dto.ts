import { IsNumber, IsString } from 'class-validator';

export class SubmitDto {
  @IsString()
  answer!: string;

  @IsNumber()
  currentTab!: number;
}
