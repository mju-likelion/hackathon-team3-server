import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { Learning } from './entities/learning.entity';
import { GetProgressRes } from './dtos/progress.dto';
import { GetChaptersRes } from './dtos/chapters.dto';
import { CreateDto } from './dtos/crud/create/create.dto';
import { CreateResponseDto } from './dtos/crud/create/create-response.dto';
import { FindOneResponseDto } from './dtos/crud/read/find-one-response.dto';
import { FindAllResponseDto } from './dtos/crud/read/find-all-response.dto';
import { UpdateDto } from './dtos/crud/update/update.dto';
import { UpdateResponseDto } from './dtos/crud/update/update-response.dto';
import { DeleteResponseDto } from './dtos/crud/delete/delete-response.dto';

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

      const userCompletedChapters = userInDb.completedChapters.filter(
        (chapter) => {
          return chapter.learning.type === +type;
        },
      );

      // 해당 타입 내 완료한 챕터 수
      const progress =
        userCompletedChapters.length === 0
          ? 0
          : learning.chapters.length / userCompletedChapters.length;

      return {
        statusCode: 200,
        message: 'Progress successfully retrieved',
        progress,
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
        order: {
          chapters: {
            order: 'ASC',
          },
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

      // 진도율 추가
      const { progress } = await this.getProgress(user, type);

      return {
        statusCode: 200,
        message: 'Chapters successfully retrieved',
        chapters: learning.chapters,
        progress,
      };
    } catch (e) {
      throw e;
    }
  }

  async create(createDto: CreateDto): Promise<CreateResponseDto> {
    const newLearning = this.learningsRepository.create(createDto);
    await this.learningsRepository.save(newLearning);

    const createResponseDto: CreateResponseDto = new CreateResponseDto();
    createResponseDto.statusCode = 201;
    createResponseDto.message = 'Learning successfully created';
    createResponseDto.generatedLearningId = newLearning.id;
    return createResponseDto;
  }

  async findOne(id: string): Promise<FindOneResponseDto> {
    const learningInDb = await this.learningsRepository.findOne({
      where: { id },
      relations: {
        chapters: true,
      },
    });
    if (!learningInDb) {
      throw new NotFoundException('Learning dose not exist');
    }
    const findOneResponseDto: FindOneResponseDto = new FindOneResponseDto();
    findOneResponseDto.statusCode = 200;
    findOneResponseDto.message = 'Learning successfully found';
    findOneResponseDto.foundLearning = learningInDb;
    return findOneResponseDto;
  }

  async findAll(): Promise<FindAllResponseDto> {
    const learningsInDb = await this.learningsRepository.find({
      relations: {
        chapters: true,
      },
    });
    if (!learningsInDb) {
      throw new NotFoundException('Learnings dose not exist');
    }
    const findAllResponseDto: FindAllResponseDto = new FindAllResponseDto();
    findAllResponseDto.statusCode = 200;
    findAllResponseDto.message = 'Learnings successfully found';
    findAllResponseDto.foundLearnings = learningsInDb;
    return findAllResponseDto;
  }

  async updateOne(
    id: string,
    updateDto: UpdateDto,
  ): Promise<UpdateResponseDto> {
    const learningInDb = await this.learningsRepository.findOne({
      where: { id },
    });
    if (!learningInDb) {
      throw new NotFoundException('Learning dose not exist');
    }

    if (updateDto.type) {
      learningInDb.type = updateDto.type;
    }

    await this.learningsRepository.update(learningInDb.id, learningInDb);

    const updateResponseDto: UpdateResponseDto = new UpdateResponseDto();
    updateResponseDto.statusCode = 200;
    updateResponseDto.message = 'Learning successfully updated';
    return updateResponseDto;
  }

  async deleteOne(id: string): Promise<DeleteResponseDto> {
    const learningInDb = await this.learningsRepository.findOne({
      where: { id },
    });
    if (!learningInDb) {
      throw new NotFoundException('Learning dose not exist');
    }
    await this.learningsRepository.delete(id);
    const deleteResponseDto: DeleteResponseDto = new DeleteResponseDto();
    deleteResponseDto.statusCode = 200;
    deleteResponseDto.message = 'Learning successfully deleted';

    return deleteResponseDto;
  }
}
