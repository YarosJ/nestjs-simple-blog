import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { UserCredentialsDto } from '../users/dto/userCredentials.dto';
import { SignInResponse } from './dto/signInResponse.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Post('/signUp')
  signUp(@Body(ValidationPipe) userCredentialsDto: UserCredentialsDto): Promise<void> {
    return this.authService.signUp(userCredentialsDto);
  }

  @Post('/signIn')
  signIn(@Body(ValidationPipe) userCredentialsDto: UserCredentialsDto): Promise<SignInResponse> {
    return this.authService.signIn(userCredentialsDto);
  }

  @Post('/refreshToken')
  refreshToken(
    @Body() { refreshToken }: { refreshToken: string },
  ): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(refreshToken);
  }
}
