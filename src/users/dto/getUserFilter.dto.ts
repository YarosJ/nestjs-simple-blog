import { IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class GetUserFilterDto {
  @IsOptional()
  id?: Types.ObjectId;

  @IsOptional()
  username?: string;
}
