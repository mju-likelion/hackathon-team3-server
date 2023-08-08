import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { Learning } from './entities/learning.entity';
import { GetProgressRes } from './dtos/progress.dto';
import { GetChaptersRes } from './dtos/chapters.dto';

@Injectable()
export class LearningsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Learning)
    private learningsRepository: Repository<Learning>,
  ) {}

  async getProgress(user: User, type: string): Promise<GetProgressRes> {
    try {
      const userInDb = await this.usersRepository.findOne({
        where: { id: user.id },
        relations: {
          completedChapters: {
            learning: true,
          },
        },
      });
      if (!userInDb) {
        throw new NotFoundException('User not found');
      }

      // 해당 타입 내 전체 챕터 수
      const learning = await this.learningsRepository.findOne({
        where: {
          type: +type,
        },
        relations: {
          chapters: true,
        },
      });
      if (!learning)
        throw new NotFoundException('Learning not found within the type');

      if (learning.chapters.length === 0)
        throw new NotFoundException('Chapters not found within the learning');
      const totalChaptersCount = learning.chapters.length;

      // 해당 타입 내 완료한 챕터 수
      const completedChaptersCount = userInDb.completedChapters.filter(
        (chapter) => chapter.learning.type === +type,
      ).length;

      const percentage = (completedChaptersCount / totalChaptersCount) * 100;
      return {
        statusCode: 200,
        message: 'Progress successfully retrieved',
        progress: percentage,
      };
    } catch (e) {
      throw e;
    }
  }

  async getChapters(user: User, type: string): Promise<GetChaptersRes> {
    try {
      const userInDb = await this.usersRepository.findOne({
        where: { id: user.id },
        relations: {
          completedChapters: true,
        },
      });
      if (!userInDb) {
        throw new NotFoundException('User not found');
      }

      const learning = await this.learningsRepository.findOne({
        where: {
          type: +type,
        },
        relations: {
          chapters: true,
        },
      });
      if (!learning) throw new NotFoundException('Learning not found ');
      if (learning.chapters.length === 0)
        throw new NotFoundException('Chapters not found within the learning');

      // 해당 챕터 완료 여부 추가
      learning.chapters.forEach((chapter) => {
        const isCompleted = userInDb.completedChapters.some(
          (completedChapter) => completedChapter.id === chapter.id,
        );
        chapter['isCompleted'] = isCompleted;
      });

      return {
        statusCode: 200,
        message: 'Chapters successfully retrieved',
        chapters: learning.chapters,
      };
    } catch (e) {
      throw e;
    }
  }
}
