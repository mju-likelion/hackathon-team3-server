import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthUser } from '../auth/auth-user.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { User } from 'src/users/entities/users.entity';
import { LearningsService } from './learnings.service';
import { GetProgressRes } from './dtos/progress.dto';
import { GetChaptersRes } from './dtos/chapters.dto';

@Controller('learnings')
export class LearningsController {
  constructor(private readonly learningsService: LearningsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('progress')
  async getProgress(
    @AuthUser() user: User,
    @Query('type') type: string,
  ): Promise<GetProgressRes> {
    return this.learningsService.getProgress(user, type);
  }

  @UseGuards(JwtAuthGuard)
  @Get('chapters')
  async getChapters(
    @AuthUser() user: User,
    @Query('type') type: string,
  ): Promise<GetChaptersRes> {
    return this.learningsService.getChapters(user, type);
  }
}
