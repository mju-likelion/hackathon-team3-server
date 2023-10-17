import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { Chapter } from './entities/chapter.entity';
import { Problem, QuestionType } from '../problems/entities/problem.entity';
import { CreateDto } from './dtos/crud/create/create.dto';
import { UpdateDto } from './dtos/crud/update/update.dto';
import { Learning } from '../learnings/entities/learning.entity';
import { ResponseDto } from '../common/dtos/response/response.dto';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Problem)
    private problemsRepository: Repository<Problem>,
    @InjectRepository(Chapter)
    private chaptersRepository: Repository<Chapter>,
    @InjectRepository(Learning)
    private learningsRepository: Repository<Learning>,
  ) {}

  async getChapter(user: User, chapterId: string): Promise<ResponseDto> {
    const userInDb = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: {
        completedChapters: {
          learning: true,
        },
        completedProblems: {
          chapter: true,
        },
      },
    });
    if (!userInDb) {
      throw new NotFoundException('user not found.');
    }

    const chapter = await this.chaptersRepository.findOne({
      where: {
        id: chapterId,
      },
      relations: {
        problems: true,
      },
    });
    if (!chapter) {
      throw new NotFoundException('chapter not found.');
    }

    const randomProblems = await this.getRandomProblems(chapter, 3);
    chapter['problemList'] = randomProblems.map((problem) => {
      const { id, type, scenario, content, answerOptions } = problem;
      if (problem.type == QuestionType.MCQ && !problem.answerOptions) {
        throw new BadRequestException(
          'problem type MCQ must have answerOptions.',
        );
      }
      return {
        id,
        type,
        scenario,
        question: content,
        answerOptions:
          type == QuestionType.MCQ ? answerOptions.split(',') : undefined,
      };
    });

    // chapter에서 가공 전 problem 제거
    delete chapter.problems;
    return new ResponseDto([{ chapter: chapter }]);
  }

  async getRandomProblems(chapter: Chapter, count: number): Promise<Problem[]> {
    const randomProblems: Problem[] = [];

    if (chapter.problems.length < 3) {
      return chapter.problems;
    }
    while (randomProblems.length < count) {
      const randomIndex = Math.floor(Math.random() * chapter.problems.length);
      const selectedProblem = chapter.problems[randomIndex];

      if (!randomProblems.includes(selectedProblem)) {
        randomProblems.push(selectedProblem);
      }
    }
    return randomProblems;
  }

  async create(createDto: CreateDto): Promise<ResponseDto> {
    const newChapter = this.chaptersRepository.create(createDto);
    if (createDto.learningId) {
      const learningIdDb = await this.learningsRepository.findOne({
        where: { id: createDto.learningId },
      });
      if (!learningIdDb) {
        throw new NotFoundException('learning does not exist.');
      }
      newChapter.learning = learningIdDb;
    }
    await this.chaptersRepository.save(newChapter);
    return new ResponseDto([{ generatedChapterId: newChapter.id }]);
  }

  async findOne(id: string): Promise<ResponseDto> {
    const chapterInDb = await this.chaptersRepository.findOne({
      where: { id },
      relations: {
        learning: true,
        problems: true,
      },
    });
    if (!chapterInDb) {
      throw new NotFoundException('chapter does not exist.');
    }
    return new ResponseDto([{ chapter: chapterInDb }]);
  }

  async findAll(): Promise<ResponseDto> {
    const chaptersInDb = await this.chaptersRepository.find({
      relations: {
        learning: true,
        problems: true,
      },
    });
    if (!chaptersInDb) {
      throw new NotFoundException('chapters does not exist.');
    }
    return new ResponseDto([{ chapters: chaptersInDb }]);
  }

  async updateOne(id: string, updateDto: UpdateDto): Promise<ResponseDto> {
    const chapterInDb = await this.chaptersRepository.findOne({
      where: { id },
    });
    if (!chapterInDb) {
      throw new NotFoundException('chapter does not exist.');
    }
    if (updateDto.learningId) {
      const learningIdDb = await this.learningsRepository.findOne({
        where: { id: updateDto.learningId },
      });
      if (!learningIdDb) {
        throw new NotFoundException('learning does not exist.');
      }
      chapterInDb.learning = learningIdDb;
    }

    this.updateChapter(updateDto, chapterInDb);
    await this.chaptersRepository.update(chapterInDb.id, chapterInDb);
    return new ResponseDto([{ chapterId: chapterInDb.id }]);
  }
  async deleteOne(id: string): Promise<ResponseDto> {
    const chapterInDb = await this.chaptersRepository.findOne({
      where: { id },
    });
    if (!chapterInDb) {
      throw new NotFoundException('chapter does not exist.');
    }
    await this.chaptersRepository.delete(id);
    return new ResponseDto([{ chapterId: id }]);
  }

  updateChapter(updateDto: UpdateDto, chapter: Chapter) {
    if (updateDto.title) {
      chapter.title = updateDto.title;
    }
    if (updateDto.helpMessage) {
      chapter.helpMessage = updateDto.helpMessage;
    }
    if (updateDto.order) {
      chapter.order = updateDto.order;
    }
  }
}
