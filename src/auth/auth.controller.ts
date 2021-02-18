import { Controller, Post, Body, ValidationPipe, UseGuards } from '@nestjs/common';
import { UserCredentialsDto } from '../users/dto/userCredentials.dto';
import { SignInResponse } from './dto/signInResponse.dto';
import { AuthService } from './auth.service';
import { GetUser } from '../users/getUser.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import WithMessageAuthGuard from '../helpers/withMessageAuth.guard';

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

  @Post('/signOut')
  @UseGuards(WithMessageAuthGuard())
  signOut(@GetUser() { _id }: UserDocument): Promise<void> {
    return this.authService.signOut(_id);
  }

  @Post('/refreshToken')
  refreshToken(
    @Body() { refreshToken }: { refreshToken: string },
  ): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(refreshToken);
  }
}
