import { CoreRes } from '../../../../common/dtos/Response.dto';
import { IsString } from 'class-validator';

export class CreateResponseDto extends CoreRes {
  @IsString()
  generatedLearningId: string;
}
