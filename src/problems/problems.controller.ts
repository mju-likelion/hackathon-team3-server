import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { AuthUser } from '../auth/auth-user.decorator';
import { User } from '../users/entities/users.entity';
import { ProblemsService } from './problems.service';
import { SubmitDto } from './dtos/submit.dto';
import { SubmitResponseDto } from './dtos/submit-response.dto';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id/submit')
  async submitProblem(
    @AuthUser() user: User,
    @Param('id') problemId,
    @Body() submitDto: SubmitDto,
  ): Promise<SubmitResponseDto> {
    return this.problemsService.scoreProblem(user, problemId, submitDto);
  }
}
