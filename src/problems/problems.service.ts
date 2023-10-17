import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { Problem, QuestionType } from './entities/problem.entity';
import { SubmitDto } from './dtos/submit.dto';
import { OpenaiService } from '../apis/openai/openai.service';
import { ScoreProblemResponseDto } from '../apis/openai/dtos/score-problem-response.dto';
import { OptimizeStringResponseDto } from '../apis/openai/dtos/optimize-string-response.dto';
import { CreateDto } from './dtos/crud/create/create.dto';
import { Chapter } from '../chapters/entities/chapter.entity';
import { UpdateDto } from './dtos/crud/update/update.dto';
import { ResponseDto } from '../common/dtos/response/response.dto';

@Injectable()
export class ProblemsService {
  constructor(
    @InjectRepository(Problem)
    private problemsRepository: Repository<Problem>,
    @InjectRepository(Chapter)
    private chaptersRepository: Repository<Chapter>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly openaiService: OpenaiService,
  ) {}

  async scoreProblem(
    user: User,
    problemId: string,
    submitDto: SubmitDto,
  ): Promise<ResponseDto> {
    let isCorrect: boolean;
    let isChapterComplete: boolean;
    const problem = await this.problemsRepository.findOne({
      where: { id: problemId },
      relations: { chapter: true },
    });

    if (!problem) {
      throw new NotFoundException('problem not found.');
    }
    console.log('사용자 제출 답', submitDto.answer);
    console.log('DB에 있는 답', problem.answer);
    if (problem.type === QuestionType.MCQ) {
      isCorrect = problem.answer === submitDto.answer;
    } else if (
      this.isSubmittedAnswerValid(
        problem.answer.toLowerCase().split(' '),
        submitDto.answer.trim(),
      )
    ) {
      isCorrect = true;
    } else {
      const optimizeStringResponseDto: OptimizeStringResponseDto =
        await this.openaiService.optimizeStringSpaces({
          requestedString: submitDto.answer,
          temperature: 0.1,
        });
      submitDto.answer = optimizeStringResponseDto.optimizedString;
      const problemAnswerTokens: string[] = problem.answer
        .toLowerCase()
        .split(' ');

      console.log('공백을 처리한 사용자 제출 답', submitDto.answer);
      console.log('split힌 DB에 있는 답', problemAnswerTokens);
      if (
        !this.isSubmittedAnswerValid(
          problemAnswerTokens,
          submitDto.answer.trim(),
        )
      ) {
        isCorrect = false;
      } else {
        if (submitDto.answer.split(' ').length === problemAnswerTokens.length) {
          isCorrect = true;
        } else {
          const scoreProblemResponseDto: ScoreProblemResponseDto =
            await this.openaiService.scoreProblem({
              originAnswer: problem.answer,
              submittedAnswer: submitDto.answer,
              temperature: 0,
            });

          if (!scoreProblemResponseDto) {
            throw new InternalServerErrorException('openAi did not response.');
          }

          isCorrect = scoreProblemResponseDto.score >= 78;
          console.log('점수', scoreProblemResponseDto.score);
        }
      }
    }
    isChapterComplete = false;
    if (isCorrect) {
      const userInDb = await this.userRepository.findOne({
        where: { id: user.id },
        relations: {
          completedProblems: { chapter: true },
          completedChapters: true,
        },
      });

      const isProblemAlreadyCompleted = userInDb.completedProblems.find(
        (p) => p.id === problem.id,
      );

      if (!isProblemAlreadyCompleted) {
        userInDb.completedProblems.push(problem);
      }
      isChapterComplete =
        userInDb.completedProblems.length >= 3 && submitDto.currentTab === 3;
      if (isChapterComplete) {
        userInDb.completedChapters.push(problem.chapter);
      }
      await this.userRepository.save(userInDb);
    }

    return new ResponseDto([
      {
        isCorrect: isCorrect,
        isChapterComplete: isChapterComplete,
      },
    ]);
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

  async create(createDto: CreateDto): Promise<ResponseDto> {
    if (createDto.type == QuestionType.MCQ) {
      if (!createDto.answerOptions) {
        throw new BadRequestException(
          'problem type MCQ must have answerOptions.',
        );
      } else if (!createDto.answerOptions.includes(',')) {
        throw new BadRequestException("answerOptions must contains ','.");
      }
    } else if (createDto.answerOptions) {
      throw new BadRequestException(
        "only MCQ can have property 'answerOptions'.",
      );
    }

    const newProblem = this.problemsRepository.create(createDto);
    if (createDto.chapterId) {
      const chapterInDb = await this.chaptersRepository.findOne({
        where: { id: createDto.chapterId },
      });
      if (!chapterInDb) {
        throw new NotFoundException('chapter does not exist.');
      }
      newProblem.chapter = chapterInDb;
    }
    await this.problemsRepository.save(newProblem);
    return new ResponseDto([{ generatedProblemId: newProblem.id }]);
  }

  async findOne(id: string): Promise<ResponseDto> {
    const problemIdDb = await this.problemsRepository.findOne({
      where: { id },
      relations: {
        chapter: true,
      },
    });
    if (!problemIdDb) {
      throw new NotFoundException('problem does not exist.');
    }
    return new ResponseDto([{ problem: problemIdDb }]);
  }

  async findAll(): Promise<ResponseDto> {
    const problemsIdDb = await this.problemsRepository.find({
      relations: {
        chapter: true,
      },
    });
    if (!problemsIdDb) {
      throw new NotFoundException('problems does not exist.');
    }
    return new ResponseDto([{ problems: problemsIdDb }]);
  }

  async updateOne(id: string, updateDto: UpdateDto): Promise<ResponseDto> {
    if (updateDto.type == QuestionType.MCQ) {
      if (!updateDto.answerOptions) {
        throw new BadRequestException(
          'problem type MCQ must have answerOptions.',
        );
      } else if (!updateDto.answerOptions.includes(',')) {
        throw new BadRequestException("answerOptions must contains ','.");
      }
    }
    if (updateDto.type != QuestionType.MCQ && updateDto.answerOptions) {
      throw new BadRequestException(
        "only MCQ can have property 'answerOptions'.",
      );
    }
    const problemInDb = await this.problemsRepository.findOne({
      where: { id },
    });
    if (!problemInDb) {
      throw new NotFoundException('problem does not exist.');
    }
    if (updateDto.chapterId) {
      const chapterInDb = await this.chaptersRepository.findOne({
        where: { id: updateDto.chapterId },
      });
      if (!chapterInDb) {
        throw new NotFoundException('chapter does not exist.');
      }
      problemInDb.chapter = chapterInDb;
    }
    this.updateProblem(updateDto, problemInDb);

    await this.problemsRepository.update(problemInDb.id, problemInDb);
    return new ResponseDto([{ problemId: id }]);
  }

  async deleteOne(id: string): Promise<ResponseDto> {
    const problemInDb = await this.problemsRepository.findOne({
      where: { id },
    });
    if (!problemInDb) {
      throw new NotFoundException('problem does not exist.');
    }
    await this.problemsRepository.delete(id);
    return new ResponseDto([{ problemId: id }]);
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
