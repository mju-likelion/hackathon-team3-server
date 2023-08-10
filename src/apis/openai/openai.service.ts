import { Inject, Injectable, UseGuards } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import { ConfigType } from '@nestjs/config';
import openaiConfig from './config/openaiConfig';
import { OpenAiChatCompletionRequestBuilder } from './request/chatCompletionRequest';
import { ScoreProblemDto } from './dtos/score-problem.dto';
import { OptimizeStringDto } from './dtos/optimize-string.dto';
import { ScoreProblemResponseDto } from './dtos/score-problem-response.dto';
import { OptimizeStringResponseDto } from './dtos/optimize-string-response.dto';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class OpenaiService {
  constructor(
    @Inject(openaiConfig.KEY) private config: ConfigType<typeof openaiConfig>,
  ) {}

  openai: OpenAIApi = new OpenAIApi(
    new Configuration({
      organization: this.config.organization,
      apiKey: this.config.apiKey,
    }),
  );

  @UseGuards(ThrottlerGuard)
  async scoreProblem(scoreProblemDto: ScoreProblemDto) {
    const openAiChatCompletionRequestBuilder: OpenAiChatCompletionRequestBuilder =
      new OpenAiChatCompletionRequestBuilder();

    openAiChatCompletionRequestBuilder.setUserRole(
      'Please rate the similarity between the two sentences(0 to 100) strictly\n' +
        'sentence A: ' +
        scoreProblemDto.originAnswer +
        '\nsentence B: ' +
        scoreProblemDto.submittedAnswer,
    );
    openAiChatCompletionRequestBuilder.setSystemRole(
      'Score 5 times and return the average value only(number)\n',
    );
    if (scoreProblemDto.temperature) {
      openAiChatCompletionRequestBuilder.setTemperature(
        scoreProblemDto.temperature,
      );
    }

    const scoreProblemResponseDto: ScoreProblemResponseDto =
      new ScoreProblemResponseDto();
    const response = await this.openai.createChatCompletion(
      openAiChatCompletionRequestBuilder.build(),
    );
    scoreProblemResponseDto.score = +response.data.choices[0].message.content;
    return scoreProblemResponseDto;
  }

  @UseGuards(ThrottlerGuard)
  async optimizeStringSpaces(optimizeStringDto: OptimizeStringDto) {
    const openAiChatCompletionRequestBuilder: OpenAiChatCompletionRequestBuilder =
      new OpenAiChatCompletionRequestBuilder();
    openAiChatCompletionRequestBuilder.setUserRole(
      'Correct the spaces in this sentence\n' +
        'sentence: ' +
        optimizeStringDto.requestedString,
    );
    openAiChatCompletionRequestBuilder.setSystemRole(
      'You have to response only result sentence\n',
    );
    if (optimizeStringDto.temperature) {
      openAiChatCompletionRequestBuilder.setTemperature(
        optimizeStringDto.temperature,
      );
    }

    const response = await this.openai.createChatCompletion(
      openAiChatCompletionRequestBuilder.build(),
    );

    const optimizeStringResponseDto: OptimizeStringResponseDto =
      new OptimizeStringResponseDto();
    optimizeStringResponseDto.optimizedString =
      response.data.choices[0].message.content;
    return optimizeStringResponseDto;
  }
}
