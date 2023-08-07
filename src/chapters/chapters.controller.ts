import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthUser } from '../auth/auth-user.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { User } from 'src/users/entities/users.entity';
import { ChaptersService } from './chapters.service';
import { GetChapterRes } from './dtos/chapter.dto';

@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getChapter(
    @AuthUser() user: User,
    @Param('id') chapterId: string,
  ): Promise<GetChapterRes> {
    return this.chaptersService.getChapter(user, chapterId);
  }
}
