import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetPostsFilterDto {
  @IsOptional()
  @IsNotEmpty()
  text?: string;

  @IsOptional()
  sorting?: 1|-1;

  @IsOptional()
  pageNumber?: number;

  @IsOptional()
  pageSize?: number;

  @IsOptional()
  user?: string;

  @IsOptional()
  personal?: boolean;
}
