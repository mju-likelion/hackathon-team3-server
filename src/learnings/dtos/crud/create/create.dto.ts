import { Column } from 'typeorm';
import { IsNumber } from 'class-validator';

export class CreateDto {
  @Column()
  @IsNumber()
  type!: number;
}
