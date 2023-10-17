import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { Learning } from './entities/learning.entity';
import { CreateDto } from './dtos/crud/create/create.dto';
import { UpdateDto } from './dtos/crud/update/update.dto';
import { ResponseDto } from '../common/dtos/response/response.dto';

@Injectable()
export class LearningsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Learning)
    private learningsRepository: Repository<Learning>,
  ) {}

  async getProgress(user: User, type: string): Promise<ResponseDto> {
    const userInDb: User = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: {
        completedChapters: {
          learning: true,
        },
      },
    });
    if (!userInDb) {
      throw new NotFoundException('user not found.');
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
    if (!learning) {
      throw new NotFoundException('learning not found within the type.');
    }
    if (learning.chapters.length === 0)
      throw new NotFoundException('chapters not found within the learning');

    const userCompletedChapters = userInDb.completedChapters.filter(
      (chapter) => {
        return chapter.learning.type === +type;
      },
    );

    // 해당 타입 내 완료한 챕터 수
    const progress =
      userCompletedChapters.length === 0
        ? 0
        : (userCompletedChapters.length / learning.chapters.length) * 100;

    return new ResponseDto([{ progress: progress }]);
  }

  async getChapters(user: User, type: string): Promise<ResponseDto> {
    const userInDb = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: {
        completedChapters: true,
      },
    });
    if (!userInDb) {
      throw new NotFoundException('user not found.');
    }

    const learning = await this.learningsRepository.findOne({
      where: {
        type: +type,
      },
      relations: {
        chapters: true,
      },
      order: {
        chapters: {
          order: 'ASC',
        },
      },
    });
    if (!learning)
      throw new NotFoundException('learning not found within the type.');
    if (learning.chapters.length === 0)
      throw new NotFoundException('chapters not found within the learning.');

    // 해당 챕터 완료 여부 추가
    learning.chapters.forEach((chapter) => {
      chapter['isCompleted'] = userInDb.completedChapters.some(
        (completedChapter) => completedChapter.id === chapter.id,
      );
    });

    // 진도율 추가
    const { progress } = await (await this.getProgress(user, type)).data;
    if (progress == null) {
      throw new NotFoundException('progress not found.');
    }
    return new ResponseDto([
      {
        chapters: learning.chapters,
        progress: progress,
      },
    ]);
  }

  async create(createDto: CreateDto): Promise<ResponseDto> {
    const newLearning = this.learningsRepository.create(createDto);
    await this.learningsRepository.save(newLearning);

    return new ResponseDto([{ generatedLearningId: newLearning.id }]);
  }

  async findOne(id: string): Promise<ResponseDto> {
    const learningInDb = await this.learningsRepository.findOne({
      where: { id },
      relations: {
        chapters: true,
      },
    });
    if (!learningInDb) {
      throw new NotFoundException('learning does not exist.');
    }

    return new ResponseDto([{ learning: learningInDb }]);
  }

  async findAll(): Promise<ResponseDto> {
    const learningsInDb = await this.learningsRepository.find({
      relations: {
        chapters: true,
      },
    });
    if (!learningsInDb) {
      throw new NotFoundException('learnings does not exist.');
    }
    return new ResponseDto([{ learnings: learningsInDb }]);
  }

  async updateOne(id: string, updateDto: UpdateDto): Promise<ResponseDto> {
    const learningInDb = await this.learningsRepository.findOne({
      where: { id },
    });
    if (!learningInDb) {
      throw new NotFoundException('learning does not exist.');
    }

    if (updateDto.type) {
      learningInDb.type = updateDto.type;
    }
    await this.learningsRepository.update(learningInDb.id, learningInDb);
    return new ResponseDto([{ learningId: id }]);
  }

  async deleteOne(id: string): Promise<ResponseDto> {
    const learningInDb = await this.learningsRepository.findOne({
      where: { id },
    });
    if (!learningInDb) {
      throw new NotFoundException('learning does not exist.');
    }
    await this.learningsRepository.delete(id);
    return new ResponseDto([{ learningId: id }]);
  }
}
