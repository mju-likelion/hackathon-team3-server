import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuthUser } from '../auth/auth-user.decorator';
import { User, UserRole } from 'src/users/entities/users.entity';
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
import { Auth } from '../common/decorator/auth/auth.decorator';

@Controller('learnings')
export class LearningsController {
  constructor(private readonly learningsService: LearningsService) {}

  @Auth(UserRole.ANY)
  @Get('progress')
  async getProgress(
    @AuthUser() user: User,
    @Query('type') type: string,
  ): Promise<GetProgressRes> {
    return this.learningsService.getProgress(user, type);
  }

  @Auth(UserRole.ANY)
  @Get('chapters')
  async getChapters(
    @AuthUser() user: User,
    @Query('type') type: string,
  ): Promise<GetChaptersRes> {
    return this.learningsService.getChapters(user, type);
  }

  @Auth(UserRole.ANY)
  @Post()
  async create(@Body() createDto: CreateDto): Promise<CreateResponseDto> {
    return this.learningsService.create(createDto);
  }

  @Auth(UserRole.ANY)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FindOneResponseDto> {
    return this.learningsService.findOne(id);
  }

  @Auth(UserRole.ANY)
  @Get()
  async findAll(): Promise<FindAllResponseDto> {
    return this.learningsService.findAll();
  }

  @Auth(UserRole.ANY)
  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() updateDto: UpdateDto,
  ): Promise<UpdateResponseDto> {
    return this.learningsService.updateOne(id, updateDto);
  }

  @Auth(UserRole.ANY)
  @Delete(':id')
  async deleteOne(@Param('id') id: string): Promise<DeleteResponseDto> {
    return this.learningsService.deleteOne(id);
  }
}
