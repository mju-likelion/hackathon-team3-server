import { CoreRes } from '../../../../common/dtos/Response.dto';
import { Problem } from '../../../entities/problem.entity';

export class FindAllResponseDto extends CoreRes {
  foundedProblems?: Problem[];
}
