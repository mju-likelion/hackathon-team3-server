import { IsString } from 'class-validator';

export class OptimizeStringResponseDto {
  @IsString()
  optimizedString!: string;
}
