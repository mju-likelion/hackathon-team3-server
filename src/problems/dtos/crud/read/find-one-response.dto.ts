import { CoreRes } from '../../../../common/dtos/Response.dto';
import { Problem } from '../../../entities/problem.entity';

export class FindOneResponseDto extends CoreRes {
  foundProblem!: Problem;
}
