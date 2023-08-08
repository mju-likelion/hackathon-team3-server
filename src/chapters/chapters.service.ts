import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetChapterRes } from './dtos/chapter.dto';
import { User } from 'src/users/entities/users.entity';
import { Chapter } from './entities/chapter.entity';
import { parseProblem } from 'src/problems/utils/problem.util';
import { QuestionType } from '../problems/entities/problem.entity';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Chapter)
    private chaptersRepository: Repository<Chapter>,
  ) {}

  async getChapter(user: User, chapterId: string): Promise<GetChapterRes> {
    try {
      const userInDb = await this.usersRepository.findOne({
        where: { id: user.id },
        relations: {
          completed_chapters: {
            learning: true,
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
      if (chapter.problems.length === 0)
        throw new NotFoundException('Problems not found within the chapter');

      // TODO: user가 아직 풀지 않은 문제들 중 랜덤으로 3개를 반환
      // chapter.problems = ???

      // 문제 가공
      chapter['problemList'] = chapter.problems.map((problem) => {
        const { id, type, scenario, content, answer, answerOptions } = problem;
        //const parsedContent = parseProblem(content, type);
        return {
          id,
          type,
          scenario,
          question: content,
          answer,
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
}
