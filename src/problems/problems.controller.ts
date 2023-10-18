import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthUser } from '../auth/auth-user.decorator';
import { User, UserRole } from '../users/entities/users.entity';
import { ProblemsService } from './problems.service';
import { SubmitDto } from './dtos/submit.dto';
import { CreateDto } from './dtos/crud/create/create.dto';
import { UpdateDto } from './dtos/crud/update/update.dto';
import { Auth } from '../common/decorator/auth/auth.decorator';
import { ResponseDto } from '../common/dtos/response/response.dto';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Auth(UserRole.ANY)
  @Post(':id/submit')
  @HttpCode(200)
  async submitProblem(
    @AuthUser() user: User,
    @Param('id') problemId,
    @Body() submitDto: SubmitDto,
  ): Promise<ResponseDto> {
    return this.problemsService.scoreProblem(user, problemId, submitDto);
  }

  @Auth(UserRole.ADMIN)
  @Post()
  async create(@Body() createDto: CreateDto): Promise<ResponseDto> {
    return this.problemsService.create(createDto);
  }

  @Auth(UserRole.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseDto> {
    return this.problemsService.findOne(id);
  }

  @Auth(UserRole.ADMIN)
  @Get()
  async findAll(): Promise<ResponseDto> {
    return this.problemsService.findAll();
  }

  @Auth(UserRole.ADMIN)
  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() updateDto: UpdateDto,
  ): Promise<ResponseDto> {
    return this.problemsService.updateOne(id, updateDto);
  }

  @Auth(UserRole.ADMIN)
  @Delete(':id')
  async deleteOne(@Param('id') id: string): Promise<ResponseDto> {
    return this.problemsService.deleteOne(id);
  }
}
