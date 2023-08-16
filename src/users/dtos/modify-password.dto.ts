import { PickType } from '@nestjs/mapped-types';
import { User } from '../entities/users.entity';
import { IsString } from 'class-validator';
import { CoreRes } from 'src/common/dtos/Response.dto';

export class ModifyPasswordReq extends PickType(User, ['password']) {
  @IsString()
  oldPassword!: string;
}

export class ModifyPasswordRes extends CoreRes {}
