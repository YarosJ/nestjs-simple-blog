import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetUsersFilterDto {
  @IsOptional()
  @IsNotEmpty()
  username?: string;

  @IsOptional()
  sorting?: 1|-1;

  @IsOptional()
  pageNumber?: number;

  @IsOptional()
  pageSize?: number;
}
