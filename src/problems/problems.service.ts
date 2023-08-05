import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { Problem } from './entities/problem.entity';
import { SubmitDto } from './dtos/submit.dto';
import { OpenaiService } from '../apis/openai/openai.service';
import { SubmitResponseDto } from './dtos/submit-response.dto';

@Injectable()
export class ProblemsService {
  constructor(
    @InjectRepository(Problem)
    private problemsRepository: Repository<Problem>,
    private readonly openaiService: OpenaiService,
  ) {}

  async scoreProblem(
    user: User,
    problemId: string,
    submitDto: SubmitDto,
  ): Promise<SubmitResponseDto> {
    try {
      const problem = await this.problemsRepository.findOne({
        where: { id: problemId },
      });
      if (!problem) {
        throw new NotFoundException('invalid problem id');
      }
      const result = await this.openaiService.scoreProblem({
        problem: problem.answer,
        answer: submitDto.answer,
        temperature: 0.2,
      });
      if (!result) {
        throw new ConflictException('openai not response');
      }
      const submitResponseDto: SubmitResponseDto = new SubmitResponseDto();
      submitResponseDto.statusCode = 200;
      submitResponseDto.message = 'request successfully submitted';
      submitResponseDto.isCorrect = +result > 8;
      return submitResponseDto;
    } catch (e) {
      throw e;
    }
  }
}
