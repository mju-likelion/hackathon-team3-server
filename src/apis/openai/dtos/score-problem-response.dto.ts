import { IsNumber } from 'class-validator';

export class ScoreProblemResponseDto {
  @IsNumber()
  score!: number;
}
