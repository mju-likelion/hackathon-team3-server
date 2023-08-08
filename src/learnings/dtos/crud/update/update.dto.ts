import { IsNumber } from 'class-validator';

export class UpdateDto {
  @IsNumber()
  type!: number;
}
