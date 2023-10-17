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
import { CreateDto } from './dtos/crud/create/create.dto';
import { UpdateDto } from './dtos/crud/update/update.dto';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { ResponseDto } from '../common/dtos/response/response.dto';

@Controller('learnings')
export class LearningsController {
  constructor(private readonly learningsService: LearningsService) {}

  @Auth(UserRole.ANY)
  @Get('progress')
  async getProgress(
    @AuthUser() user: User,
    @Query('type') type: string,
  ): Promise<ResponseDto> {
    return this.learningsService.getProgress(user, type);
  }

  @Auth(UserRole.ANY)
  @Get('chapters')
  async getChapters(
    @AuthUser() user: User,
    @Query('type') type: string,
  ): Promise<ResponseDto> {
    return this.learningsService.getChapters(user, type);
  }

  @Auth(UserRole.ADMIN)
  @Post()
  async create(@Body() createDto: CreateDto): Promise<ResponseDto> {
    return this.learningsService.create(createDto);
  }

  @Auth(UserRole.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseDto> {
    return this.learningsService.findOne(id);
  }

  @Auth(UserRole.ADMIN)
  @Get()
  async findAll(): Promise<ResponseDto> {
    return this.learningsService.findAll();
  }

  @Auth(UserRole.ADMIN)
  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() updateDto: UpdateDto,
  ): Promise<ResponseDto> {
    return this.learningsService.updateOne(id, updateDto);
  }

  @Auth(UserRole.ADMIN)
  @Delete(':id')
  async deleteOne(@Param('id') id: string): Promise<ResponseDto> {
    return this.learningsService.deleteOne(id);
  }
}
