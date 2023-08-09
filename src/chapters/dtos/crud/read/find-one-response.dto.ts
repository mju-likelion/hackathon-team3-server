import { CoreRes } from '../../../../common/dtos/Response.dto';
import { Chapter } from '../../../entities/chapter.entity';

export class FindOneResponseDto extends CoreRes {
  foundChapter!: Chapter;
}
