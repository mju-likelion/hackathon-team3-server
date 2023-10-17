export class ResponseDto {
  data: any;
  meta?: any[];

  constructor(data: any[], meta?: any[]) {
    this.data = data;
    this.meta = meta || [];
  }
}
