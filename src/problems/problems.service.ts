import {
  BadRequestException,
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
import { CreateDto } from './dtos/crud/create/create.dto';
import { CreateResponseDto } from './dtos/crud/create/create-response.dto';
import { Chapter } from '../chapters/entities/chapter.entity';
import { FindOneResponseDto } from './dtos/crud/read/find-one-response.dto';
import { FindAllResponseDto } from './dtos/crud/read/find-all-response.dto';
import { UpdateDto } from './dtos/crud/update/update.dto';
import { UpdateResponseDto } from './dtos/crud/update/update-response.dto';
import { DeleteResponseDto } from './dtos/crud/delete/delete-response.dto';

@Injectable()
export class ProblemsService {
  constructor(
    @InjectRepository(Problem)
    private problemsRepository: Repository<Problem>,
    @InjectRepository(Chapter)
    private chaptersRepository: Repository<Chapter>,
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

  async create(createDto: CreateDto): Promise<CreateResponseDto> {
    if (createDto.type == QuestionType.MCQ) {
      if (!createDto.answerOptions) {
        throw new BadRequestException(
          'Problem type MCQ must have answerOptions',
        );
      } else if (!createDto.answerOptions.includes(',')) {
        throw new BadRequestException("AnswerOptions must contains ','");
      }
    } else if (createDto.answerOptions) {
      throw new BadRequestException(
        "Only MCQ can have property 'answerOptions'",
      );
    }

    const newProblem = this.problemsRepository.create(createDto);
    if (createDto.chapterId) {
      const chapterInDb = await this.chaptersRepository.findOne({
        where: { id: createDto.chapterId },
      });
      if (!chapterInDb) {
        throw new NotFoundException('Problem dose not exist');
      }
      newProblem.chapter = chapterInDb;
    }
    await this.problemsRepository.save(newProblem);

    const createResponseDto: CreateResponseDto = new CreateResponseDto();
    createResponseDto.statusCode = 201;
    createResponseDto.message = 'Problem successfully created';
    createResponseDto.generatedProblemId = newProblem.id;
    return createResponseDto;
  }

  async findOne(id: string): Promise<FindOneResponseDto> {
    const problemIdDb = await this.problemsRepository.findOne({
      where: { id },
      relations: {
        chapter: true,
      },
    });
    if (!problemIdDb) {
      throw new NotFoundException('Problem dose not exist');
    }
    const findOneResponseDto: FindOneResponseDto = new FindOneResponseDto();
    findOneResponseDto.statusCode = 200;
    findOneResponseDto.message = 'Problem successfully found';
    findOneResponseDto.foundProblem = problemIdDb;
    return findOneResponseDto;
  }

  async findAll(): Promise<FindAllResponseDto> {
    const problemsIdDb = await this.problemsRepository.find({
      relations: {
        chapter: true,
      },
    });
    if (!problemsIdDb) {
      throw new NotFoundException('Problems dose not exist');
    }

    const findAllResponseDto: FindAllResponseDto = new FindAllResponseDto();
    findAllResponseDto.statusCode = 200;
    findAllResponseDto.message = 'Problems successfully found';
    findAllResponseDto.foundedProblems = problemsIdDb;
    return findAllResponseDto;
  }

  async updateOne(
    id: string,
    updateDto: UpdateDto,
  ): Promise<UpdateResponseDto> {
    if (updateDto.type == QuestionType.MCQ) {
      if (!updateDto.answerOptions) {
        throw new BadRequestException(
          'Problem type MCQ must have answerOptions',
        );
      } else if (!updateDto.answerOptions.includes(',')) {
        throw new BadRequestException("AnswerOptions must contains ','");
      }
    }
    if (updateDto.type != QuestionType.MCQ && updateDto.answerOptions) {
      throw new BadRequestException(
        "Only MCQ can have property 'answerOptions'",
      );
    }
    const problemInDb = await this.problemsRepository.findOne({
      where: { id },
    });
    if (!problemInDb) {
      throw new NotFoundException('Problem dose not exist');
    }
    if (updateDto.chapterId) {
      const chapterInDb = await this.chaptersRepository.findOne({
        where: { id: updateDto.chapterId },
      });
      if (!chapterInDb) {
        throw new NotFoundException('Chapter dose not exist');
      }
      problemInDb.chapter = chapterInDb;
    }
    this.updateProblem(updateDto, problemInDb);

    await this.problemsRepository.update(problemInDb.id, problemInDb);

    const updateResponseDto: UpdateResponseDto = new UpdateResponseDto();
    updateResponseDto.statusCode = 200;
    updateResponseDto.message = 'Problem successfully updated';
    return updateResponseDto;
  }

  async deleteOne(id: string): Promise<DeleteResponseDto> {
    const problemInDb = await this.problemsRepository.findOne({
      where: { id },
    });
    if (!problemInDb) {
      throw new NotFoundException('Problem dose not exist');
    }
    await this.problemsRepository.delete(id);
    const deleteResponseDto: DeleteResponseDto = new DeleteResponseDto();
    deleteResponseDto.statusCode = 200;
    deleteResponseDto.message = 'Problem successfully deleted';

    return deleteResponseDto;
  }

  updateProblem(updateDto, problem) {
    if (updateDto.type) {
      problem.type = updateDto.type;
    }
    if (updateDto.scenario) {
      problem.scenario = updateDto.scenario;
    }
    if (updateDto.content) {
      problem.content = updateDto.content;
    }
    if (updateDto.answer) {
      problem.answer = updateDto.answer;
    }
    if (updateDto.answerOptions) {
      problem.answerOptions = updateDto.answerOptions;
    }
  }
}
