import { IsNumber, IsString, Min } from 'class-validator';
export class RequestDto {
  @IsString()
  problem!: string;

  @IsString()
  answer!: string;

  @IsNumber()
  @Min(0, { message: 'Temperature must be greater than or equal to 0' })
  temperature?: number;
}
