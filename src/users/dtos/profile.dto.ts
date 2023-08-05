import { IntersectionType, OmitType } from '@nestjs/mapped-types';
import { User } from '../entities/users.entity';
import { CoreRes } from 'src/common/dtos/Response.dto';

export class ProfileRes extends CoreRes {
  user!: User;
}
