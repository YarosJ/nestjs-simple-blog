import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateResourceDto {
  @IsNotEmpty()
  filename: string;

  @IsOptional()
  post?: Types.ObjectId;
}
