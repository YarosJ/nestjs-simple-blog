import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetPostsFilterDto {
  @IsOptional()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  personal: boolean;
}
