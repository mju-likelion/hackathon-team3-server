import { IsEmail, IsString, Matches } from 'class-validator';

export class CreateDto {
  @IsString()
  nickname!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Password must be at least 8 characters(en) long, contain 1 number',
  })
  password!: string;
}
