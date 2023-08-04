import { IsNumber } from 'class-validator';
import { CoreRes } from 'src/common/dtos/Response.dto';

export class GetProgressRes extends CoreRes {
  @IsNumber()
  progress!: number;
}
