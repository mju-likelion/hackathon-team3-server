import { CreateChatCompletionRequest } from 'openai';

export class OpenAiChatCompletionRequestBuilder {
  private readonly openAiChatCompletionRequest: CreateChatCompletionRequest;

  constructor() {
    this.openAiChatCompletionRequest = {
      model: 'gpt-3.5-turbo',
      messages: [],
      temperature: 0.2,
    };
  }

  public setModel(model: string) {
    this.openAiChatCompletionRequest.model = model;
  }

  public setUserRole(content: string) {
    this.openAiChatCompletionRequest.messages.push({
      role: 'user',
      content: content,
    });
  }

  public setSystemRole(content: string) {
    this.openAiChatCompletionRequest.messages.push({
      role: 'system',
      content: content,
    });
  }

  public setTemperature(temperature: number) {
    this.openAiChatCompletionRequest.temperature = temperature;
  }

  public build(): CreateChatCompletionRequest {
    return this.openAiChatCompletionRequest;
  }
}
