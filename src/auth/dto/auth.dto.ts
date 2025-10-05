import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(3)
  username: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
