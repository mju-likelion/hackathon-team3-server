import { CoreRes } from '../../common/dtos/Response.dto';

export class SubmitResponseDto extends CoreRes {
  isCorrect?: boolean;
  isChapterComplete!: boolean;
}
