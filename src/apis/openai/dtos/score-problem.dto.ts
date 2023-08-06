import { IsNumber, IsString, Min } from 'class-validator';
export class ScoreProblemDto {
  @IsString()
  originAnswer!: string;

  @IsString()
  submittedAnswer!: string;

  @IsNumber()
  @Min(0, { message: 'Temperature must be greater than or equal to 0' })
  temperature?: number;
}
