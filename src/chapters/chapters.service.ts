import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetChapterRes } from './dtos/chapter.dto';
import { User } from 'src/users/entities/users.entity';
import { Chapter } from './entities/chapter.entity';
import { Problem, QuestionType } from '../problems/entities/problem.entity';
import { CreateDto } from './dtos/crud/create/create.dto';
import { CreateResponseDto } from './dtos/crud/create/create-response.dto';
import { FindOneResponseDto } from './dtos/crud/read/find-one-response.dto';
import { FindAllResponseDto } from './dtos/crud/read/find-all-response.dto';
import { UpdateDto } from './dtos/crud/update/update.dto';
import { UpdateResponseDto } from './dtos/crud/update/update-response.dto';
import { DeleteResponseDto } from './dtos/crud/delete/delete-response.dto';
import { Learning } from '../learnings/entities/learning.entity';

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

  async getChapter(user: User, chapterId: string): Promise<GetChapterRes> {
    try {
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
        throw new NotFoundException('User not found');
      }

      const chapter = await this.chaptersRepository.findOne({
        where: {
          id: chapterId,
        },
        relations: {
          problems: true,
        },
      });
      if (!chapter) throw new NotFoundException('Chapter not found');

      const randomProblems = await this.getRandomProblems(chapter, 3);
      chapter['problemList'] = randomProblems.map((problem) => {
        const { id, type, scenario, content, answerOptions } = problem;
        if (problem.type == QuestionType.MCQ && !problem.answerOptions) {
          throw new BadRequestException(
            'Problem type MCQ must have answerOptions',
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

      return {
        statusCode: 200,
        message: 'Chapter successfully retrieved',
        chapter,
      };
    } catch (e) {
      throw e;
    }
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

  async create(createDto: CreateDto): Promise<CreateResponseDto> {
    const newChapter = this.chaptersRepository.create(createDto);
    if (createDto.learningId) {
      const learningIdDb = await this.learningsRepository.findOne({
        where: { id: createDto.learningId },
      });
      if (!learningIdDb) {
        throw new NotFoundException('Learning dose not exist');
      }
      newChapter.learning = learningIdDb;
    }
    await this.chaptersRepository.save(newChapter);

    const createResponseDto: CreateResponseDto = new CreateResponseDto();
    createResponseDto.statusCode = 201;
    createResponseDto.message = 'Chapter successfully created';
    createResponseDto.generatedChapterId = newChapter.id;
    return createResponseDto;
  }

  async findOne(id: string): Promise<FindOneResponseDto> {
    const chapterInDb = await this.chaptersRepository.findOne({
      where: { id },
      relations: {
        learning: true,
        problems: true,
      },
    });
    if (!chapterInDb) {
      throw new NotFoundException('Chapter dose not exist');
    }
    const findOneResponseDto: FindOneResponseDto = new FindOneResponseDto();
    findOneResponseDto.statusCode = 200;
    findOneResponseDto.message = 'Chapter successfully found';
    findOneResponseDto.foundChapter = chapterInDb;
    return findOneResponseDto;
  }

  async findAll(): Promise<FindAllResponseDto> {
    const chaptersInDb = await this.chaptersRepository.find({
      relations: {
        learning: true,
        problems: true,
      },
    });
    if (!chaptersInDb) {
      throw new NotFoundException('Chapters dose not exist');
    }

    const findAllResponseDto: FindAllResponseDto = new FindAllResponseDto();
    findAllResponseDto.statusCode = 200;
    findAllResponseDto.message = 'Chapters successfully found';
    findAllResponseDto.foundedChapters = chaptersInDb;
    return findAllResponseDto;
  }

  async updateOne(
    id: string,
    updateDto: UpdateDto,
  ): Promise<UpdateResponseDto> {
    const chapterInDb = await this.chaptersRepository.findOne({
      where: { id },
    });
    if (!chapterInDb) {
      throw new NotFoundException('Chapter dose not exist');
    }
    if (updateDto.learningId) {
      const learningIdDb = await this.learningsRepository.findOne({
        where: { id: updateDto.learningId },
      });
      if (!learningIdDb) {
        throw new NotFoundException('Learning dose not exist');
      }
      chapterInDb.learning = learningIdDb;
    }

    this.updateChapter(updateDto, chapterInDb);
    await this.chaptersRepository.update(chapterInDb.id, chapterInDb);

    const updateResponseDto: UpdateResponseDto = new UpdateResponseDto();
    updateResponseDto.statusCode = 200;
    updateResponseDto.message = 'Chapter successfully updated';
    return updateResponseDto;
  }
  async deleteOne(id: string): Promise<DeleteResponseDto> {
    const chapterInDb = await this.chaptersRepository.findOne({
      where: { id },
    });
    if (!chapterInDb) {
      throw new NotFoundException('Chapter dose not exist');
    }
    await this.chaptersRepository.delete(id);
    const deleteResponseDto: DeleteResponseDto = new DeleteResponseDto();
    deleteResponseDto.statusCode = 200;
    deleteResponseDto.message = 'Chapter successfully deleted';

    return deleteResponseDto;
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
