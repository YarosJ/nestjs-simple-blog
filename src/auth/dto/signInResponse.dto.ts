/* tslint:disable variable-name */

import { IsNotEmpty } from 'class-validator';

export class SignInResponse {
  @IsNotEmpty()
  accessToken: string;

  @IsNotEmpty()
  refreshToken: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  _id: string;
}
