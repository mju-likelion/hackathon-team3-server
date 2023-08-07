import { BadRequestException, Injectable } from '@nestjs/common';
import { QuestionType } from '../entities/problem.entity';

@Injectable()
export class ProblemUtil {
  parseProblem(
    content: string,
    type: QuestionType,
  ):
    | {
        content: string;
        choices: string[];
      }
    | {
        content: string;
        choices?: undefined;
      } {
    /**
     * @description
     * 문제의 내용 - 문제와 문제에 필요한 정보를 담고 있음
     *
     * @example
     * case 1: 객관식
     * “문제:멋쟁이 사자처럼의 대표 색깔은?보기:검정색,노란색,파란색,빨간색"
     *
     * case 2: 주관식
     * “문제:멋쟁이 사자처럼의 대표 색깔은?"
     *
     * case 3: 빈칸
     * “문제:멋쟁이 사자처럼의 대표 색깔은 @@@이다."
     */

    // 전처리
    content = content.replace(/문제:/g, '');
    // 객관식
    if (type === QuestionType.MCQ) {
      const tmp = content.split('보기:');
      content = tmp[0];
      const choices = tmp[1].split(',');

      console.log(choices);
      return {
        content,
        choices,
      };
    }
    // 주관식
    else if (type === QuestionType.SAQ) {
      content = content.split('필수단어:')[0];
      return {
        content,
      };
    } else if (type === QuestionType.FITB) {
      return {
        content,
      };
    } else {
      throw new BadRequestException('문제 형식이 잘못되었습니다.');
    }
  }
}
