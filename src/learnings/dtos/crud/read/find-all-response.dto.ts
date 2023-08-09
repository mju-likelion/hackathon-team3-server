import { Learning } from '../../../entities/learning.entity';
import { CoreRes } from '../../../../common/dtos/Response.dto';

export class FindAllResponseDto extends CoreRes {
  foundLearnings?: Learning[];
}
