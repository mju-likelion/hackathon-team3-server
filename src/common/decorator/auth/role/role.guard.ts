import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserRole } from '../../../../users/entities/users.entity';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<UserRole>('roles', context.getHandler());

    if (!roles) {
      throw new NotFoundException('Roles not defined');
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (roles.includes('ANY')) {
      return true;
    }
    if (user.role !== roles[0]) {
      throw new ForbiddenException('Unauthorized User');
    }
    return roles.includes(user.role);
  }
}
