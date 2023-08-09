import { CoreRes } from '../../../../common/dtos/Response.dto';
import { Learning } from '../../../entities/learning.entity';

export class FindOneResponseDto extends CoreRes {
  foundLearning!: Learning;
}
