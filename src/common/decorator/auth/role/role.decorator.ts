import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../../users/entities/users.entity';

export const Role = (...roles: UserRole[]) => SetMetadata('roles', roles);
