import { PickType } from '@nestjs/mapped-types';
import { User } from '../entities/users.entity';
import { IsString } from 'class-validator';

export class ModifyPasswordReq extends PickType(User, ['password']) {
  @IsString()
  oldPassword!: string;
}
