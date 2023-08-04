import { Chapter } from 'src/chapters/entities/chapter.entity';
import { CoreRes } from 'src/common/dtos/Response.dto';

export class GetChaptersRes extends CoreRes {
  chapters!: Chapter[];
}
