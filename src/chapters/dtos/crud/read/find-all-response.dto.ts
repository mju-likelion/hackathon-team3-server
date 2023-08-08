import { CoreRes } from '../../../../common/dtos/Response.dto';
import { Chapter } from '../../../entities/chapter.entity';

export class FindAllResponseDto extends CoreRes {
  foundedChapters?: Chapter[];
}
