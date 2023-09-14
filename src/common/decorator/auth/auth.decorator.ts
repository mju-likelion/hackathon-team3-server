import { UserRole } from '../../../users/entities/users.entity';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from './role/role.decorator';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { RoleGuard } from './role/role.guard';

export function Auth(roles: UserRole) {
  return applyDecorators(
    Role(roles),
    UseGuards(JwtAuthGuard),
    UseGuards(RoleGuard),
  );
}
