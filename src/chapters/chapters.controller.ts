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
import { CreateDto } from './dtos/crud/create/create.dto';
import { UpdateDto } from './dtos/crud/update/update.dto';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { ResponseDto } from '../common/dtos/response/response.dto';

@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Auth(UserRole.ANY)
  @Get(':id')
  async getChapter(
    @AuthUser() user: User,
    @Param('id') chapterId: string,
  ): Promise<ResponseDto> {
    return this.chaptersService.getChapter(user, chapterId);
  }

  @Auth(UserRole.ADMIN)
  @Post()
  async create(@Body() createDto: CreateDto): Promise<ResponseDto> {
    return this.chaptersService.create(createDto);
  }

  @Auth(UserRole.ADMIN)
  @Get('/:id/all')
  async findOne(@Param('id') id: string): Promise<ResponseDto> {
    return this.chaptersService.findOne(id);
  }

  @Auth(UserRole.ADMIN)
  @Get()
  async findAll(): Promise<ResponseDto> {
    return this.chaptersService.findAll();
  }

  @Auth(UserRole.ADMIN)
  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() updateDto: UpdateDto,
  ): Promise<ResponseDto> {
    return this.chaptersService.updateOne(id, updateDto);
  }

  @Auth(UserRole.ADMIN)
  @Delete(':id')
  async deleteOne(@Param('id') id: string): Promise<ResponseDto> {
    return this.chaptersService.deleteOne(id);
  }
}
