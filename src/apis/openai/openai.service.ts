import { Inject, Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import { ConfigType } from '@nestjs/config';
import openaiConfig from './config/openaiConfig';
import { OpenAiChatCompletionRequestBuilder } from './request/chatCompletionRequest';
import { RequestDto } from './requestdto/request.dto';

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
  async scoreProblem(requestDto: RequestDto) {
    const openAiChatCompletionRequestBuilder: OpenAiChatCompletionRequestBuilder =
      new OpenAiChatCompletionRequestBuilder();
    openAiChatCompletionRequestBuilder.setUserRole(
      'Score how similar two sentences are(0~10)\n' +
        '1: ' +
        requestDto.problem +
        '\n 2: ' +
        requestDto.answer,
    );
    openAiChatCompletionRequestBuilder.setSystemRole(
      'you have to response only score of answer',
    );
    if (requestDto.temperature) {
      openAiChatCompletionRequestBuilder.setTemperature(requestDto.temperature);
    }
    const response = await this.openai.createChatCompletion(
      openAiChatCompletionRequestBuilder.build(),
    );

    return response.data.choices[0].message.content;
  }
}
