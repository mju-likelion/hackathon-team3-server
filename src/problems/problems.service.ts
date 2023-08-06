import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { Problem, QuestionType } from './entities/problem.entity';
import { SubmitDto } from './dtos/submit.dto';
import { OpenaiService } from '../apis/openai/openai.service';
import { SubmitResponseDto } from './dtos/submit-response.dto';
import { ScoreProblemResponseDto } from '../apis/openai/dtos/score-problem-response.dto';
import { OptimizeStringResponseDto } from '../apis/openai/dtos/optimize-string-response.dto';

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
    const submitResponseDto: SubmitResponseDto = new SubmitResponseDto();
    submitResponseDto.statusCode = 200;
    submitResponseDto.message = 'Problem successfully submitted';

    try {
      const problem = await this.problemsRepository.findOne({
        where: { id: problemId },
      });

      if (!problem) {
        throw new NotFoundException('Invalid problem ID');
      }

      if (problem.type === QuestionType.MCQ) {
        submitResponseDto.isCorrect = problem.answer === submitDto.answer;
      } else {
        const optimizeStringResponseDto: OptimizeStringResponseDto =
          await this.openaiService.optimizeStringSpaces({
            requestedString: submitDto.answer,
            temperature: 0.1,
          });
        submitDto.answer = optimizeStringResponseDto.optimizedString;
        const problemAnswerTokens: string[] = problem.answer.split(' ');

        if (
          !this.isSubmittedAnswerValid(
            problemAnswerTokens,
            submitDto.answer.trim(),
          )
        ) {
          submitResponseDto.isCorrect = false;
        } else {
          const scoreProblemResponseDto: ScoreProblemResponseDto =
            await this.openaiService.scoreProblem({
              originAnswer: problem.answer,
              submittedAnswer: submitDto.answer,
              temperature: 0,
            });

          if (!scoreProblemResponseDto) {
            throw new ConflictException('OpenAI did not response');
          }

          submitResponseDto.isCorrect = scoreProblemResponseDto.score >= 78;
        }
      }

      return submitResponseDto;
    } catch (e) {
      throw e;
    }
  }

  isSubmittedAnswerValid(
    problemAnswerTokens: string[],
    submittedAnswer: string,
  ) {
    let isValuableAnswer = true;
    for (const answer of problemAnswerTokens) {
      if (!submittedAnswer.includes(answer)) {
        isValuableAnswer = false;
        break;
      }
    }
    return isValuableAnswer;
  }
}
