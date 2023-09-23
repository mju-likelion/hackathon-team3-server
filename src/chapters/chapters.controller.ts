import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthUser } from '../auth/auth-user.decorator';
import { User, UserRole } from 'src/users/entities/users.entity';
import { ChaptersService } from './chapters.service';
import { GetChapterRes } from './dtos/chapter.dto';
import { CreateDto } from './dtos/crud/create/create.dto';
import { CreateResponseDto } from './dtos/crud/create/create-response.dto';
import { FindOneResponseDto } from './dtos/crud/read/find-one-response.dto';
import { FindAllResponseDto } from './dtos/crud/read/find-all-response.dto';
import { UpdateDto } from './dtos/crud/update/update.dto';
import { UpdateResponseDto } from './dtos/crud/update/update-response.dto';
import { DeleteResponseDto } from './dtos/crud/delete/delete-response.dto';
import { Auth } from '../common/decorator/auth/auth.decorator';

@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Auth(UserRole.ANY)
  @Get(':id')
  async getChapter(
    @AuthUser() user: User,
    @Param('id') chapterId: string,
  ): Promise<GetChapterRes> {
    return this.chaptersService.getChapter(user, chapterId);
  }

  @Auth(UserRole.ADMIN)
  @Post()
  async create(@Body() createDto: CreateDto): Promise<CreateResponseDto> {
    return this.chaptersService.create(createDto);
  }

  @Auth(UserRole.ADMIN)
  @Get('/:id/all')
  async findOne(@Param('id') id: string): Promise<FindOneResponseDto> {
    return this.chaptersService.findOne(id);
  }

  @Auth(UserRole.ADMIN)
  @Get()
  async findAll(): Promise<FindAllResponseDto> {
    return this.chaptersService.findAll();
  }

  @Auth(UserRole.ADMIN)
  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() updateDto: UpdateDto,
  ): Promise<UpdateResponseDto> {
    return this.chaptersService.updateOne(id, updateDto);
  }

  @Auth(UserRole.ADMIN)
  @Delete(':id')
  async deleteOne(@Param('id') id: string): Promise<DeleteResponseDto> {
    return this.chaptersService.deleteOne(id);
  }
}
