import { JwtService } from '@nestjs/jwt';
// import Redis from 'ioredis';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { SignInResponse } from './dto/signInResponse.dto';
import { UserCredentialsDto } from '../users/dto/userCredentials.dto';
import { JwtPayload } from './jwt/jwtPayload.interface';
import * as config from 'config';

@Injectable()
export class AuthService {
  // private static redisInstance: Redis.Redis;
  private logger = new Logger('AuthService');

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    // if (!AuthService.redisInstance) {
    //   AuthService.redisInstance = new Redis({
    //     keyPrefix: 'jwt-refresh_',
    //     host: process.env.REDIS_HOST || config.get('redisHost'),
    //     port: process.env.REDIS_PORT || config.get('redisPort'),
    //   });
    // }
  }

  async signUp(userCredentialsDto: UserCredentialsDto): Promise<void> {
    await this.usersService.createUser(userCredentialsDto);
  }

  async signIn(
    { username, password }: UserCredentialsDto,
  ): Promise<SignInResponse> {
    const user: UserDocument = await this.usersService.getUser({ username });

    if (!user || !(await user.validatePassword(password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { username };
    const accessToken = await this.jwtService.sign(payload);
    const refreshToken = await this.jwtService.sign(payload, {
      expiresIn: config.get('jwt.expiresIn.refreshToken'),
    });

    this.logger.debug(`Generated JWT Token with payload ${JSON.stringify(payload)}`);

    return { accessToken, refreshToken, username, _id: user._id };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = await this.jwtService.verify(refreshToken);

      delete payload.exp;
      delete payload.iat;

      const accessToken = await this.jwtService.sign(payload);

      return { accessToken };
    } catch (e) {
      this.logger.debug(JSON.stringify(e));

      throw new UnauthorizedException('Refresh token expired');
    }
  }
}
