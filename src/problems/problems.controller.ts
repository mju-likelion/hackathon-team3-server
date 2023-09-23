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
import { User, UserRole } from '../users/entities/users.entity';
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
import { Auth } from '../common/decorator/auth/auth.decorator';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Auth(UserRole.ANY)
  @Post(':id/submit')
  async submitProblem(
    @AuthUser() user: User,
    @Param('id') problemId,
    @Body() submitDto: SubmitDto,
  ): Promise<SubmitResponseDto> {
    return this.problemsService.scoreProblem(user, problemId, submitDto);
  }

  @Auth(UserRole.ADMIN)
  @Post()
  async create(@Body() createDto: CreateDto): Promise<CreateResponseDto> {
    return this.problemsService.create(createDto);
  }

  @Auth(UserRole.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FindOneResponseDto> {
    return this.problemsService.findOne(id);
  }

  @Auth(UserRole.ADMIN)
  @Get()
  async findAll(): Promise<FindAllResponseDto> {
    return this.problemsService.findAll();
  }

  @Auth(UserRole.ADMIN)
  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() updateDto: UpdateDto,
  ): Promise<UpdateResponseDto> {
    return this.problemsService.updateOne(id, updateDto);
  }

  @Auth(UserRole.ADMIN)
  @Delete(':id')
  async deleteOne(@Param('id') id: string): Promise<DeleteResponseDto> {
    return this.problemsService.deleteOne(id);
  }
}
