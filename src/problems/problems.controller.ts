import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { AuthUser } from '../auth/auth-user.decorator';
import { User } from '../users/entities/users.entity';
import { ProblemsService } from './problems.service';
import { SubmitDto } from './dtos/submit.dto';
import { SubmitResponseDto } from './dtos/submit-response.dto';
import { CreateDto } from './dtos/crud/create/create.dto';
import { CreateResponseDto } from './dtos/crud/create/create-response.dto';
import { FindOneResponseDto } from './dtos/crud/read/find-one-response.dto';
import { FindAllResponseDto } from './dtos/crud/read/find-all-response.dto';
import { UpdateDto } from './dtos/crud/update/update.dto';
import { UpdateResponseDto } from './dtos/crud/update/update-response.dto';
import { DeleteResponseDto } from './dtos/crud/delete/delete-response.dto';
import { ThrottlerBehindProxyGuard } from './throttler-behind-proxy.guard';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @UseGuards(ThrottlerBehindProxyGuard, JwtAuthGuard)
  @Post(':id/submit')
  async submitProblem(
    @AuthUser() user: User,
    @Param('id') problemId,
    @Body() submitDto: SubmitDto,
  ): Promise<SubmitResponseDto> {
    return this.problemsService.scoreProblem(user, problemId, submitDto);
  }

  @Post()
  async create(@Body() createDto: CreateDto): Promise<CreateResponseDto> {
    return this.problemsService.create(createDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FindOneResponseDto> {
    return this.problemsService.findOne(id);
  }

  @Get()
  async findAll(): Promise<FindAllResponseDto> {
    return this.problemsService.findAll();
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() updateDto: UpdateDto,
  ): Promise<UpdateResponseDto> {
    return this.problemsService.updateOne(id, updateDto);
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string): Promise<DeleteResponseDto> {
    return this.problemsService.deleteOne(id);
  }
}
