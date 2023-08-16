import { PickType } from '@nestjs/mapped-types';
import { User } from '../entities/users.entity';
import { IsString, Matches } from 'class-validator';
import { CoreRes } from 'src/common/dtos/Response.dto';

export class ModifyPasswordReq extends PickType(User, ['password']) {
  @IsString()
  @Matches(/^(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Password must be at least 8 characters(en) long, contain 1 number',
  })
  oldPassword!: string;
}

export class ModifyPasswordRes extends CoreRes {}
