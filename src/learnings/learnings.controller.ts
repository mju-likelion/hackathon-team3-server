import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthUser } from '../auth/auth-user.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { User } from 'src/users/entities/users.entity';
import { LearningsService } from './learnings.service';
import { GetProgressRes } from './dtos/progress.dto';
import { GetChaptersRes } from './dtos/chapters.dto';
import { CreateDto } from './dtos/crud/create/create.dto';
import { CreateResponseDto } from './dtos/crud/create/create-response.dto';
import { FindOneResponseDto } from './dtos/crud/read/find-one-response.dto';
import { FindAllResponseDto } from './dtos/crud/read/find-all-response.dto';
import { UpdateDto } from './dtos/crud/update/update.dto';
import { UpdateResponseDto } from './dtos/crud/update/update-response.dto';
import { DeleteResponseDto } from './dtos/crud/delete/delete-response.dto';

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

  @Post()
  async create(@Body() createDto: CreateDto): Promise<CreateResponseDto> {
    return this.learningsService.create(createDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FindOneResponseDto> {
    return this.learningsService.findOne(id);
  }

  @Get()
  async findAll(): Promise<FindAllResponseDto> {
    return this.learningsService.findAll();
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() updateDto: UpdateDto,
  ): Promise<UpdateResponseDto> {
    return this.learningsService.updateOne(id, updateDto);
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string): Promise<DeleteResponseDto> {
    return this.learningsService.deleteOne(id);
  }
}
