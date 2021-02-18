import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as Redis from 'ioredis';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { SignInResponse } from './dto/signInResponse.dto';
import { UserCredentialsDto } from '../users/dto/userCredentials.dto';
import { JwtPayload } from './jwt/jwtPayload.interface';
import * as config from 'config';

@Injectable()
export class AuthService {
  private static redisInstance: Redis.Redis;
  private logger = new Logger('AuthService');

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    if (!AuthService.redisInstance) {
      AuthService.redisInstance = new Redis({
        keyPrefix: 'jwt-refresh_',
        host: process.env.REDIS_HOST || config.get('redis.host'),
        port: process.env.REDIS_PORT || config.get('redis.port'),
      });
    }
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

    const { _id } = user;
    const payload: JwtPayload = { username, _id };
    const accessToken = await this.jwtService.sign(payload);
    const refreshTokenExpiration = config.get('jwt.expiresIn.refreshToken');
    const refreshToken = await AuthService.redisInstance.get(_id) || await this.jwtService.sign(payload, {
      expiresIn: refreshTokenExpiration,
    });

    await AuthService.redisInstance.set(
      _id,
      refreshToken,
      'ex',
      refreshTokenExpiration,
    );

    this.logger.debug(`Generated JWT Token with payload ${JSON.stringify(payload)}`);

    return { accessToken, refreshToken, username, _id };
  }

  async signOut(id: string) {
    this.logger.debug(`Reset Refresh Token for id: ${id}`);
    await AuthService.redisInstance.del(id);
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const { _id, username }: JwtPayload = await this.jwtService.verify(refreshToken);

      if (await AuthService.redisInstance.get(_id)) {
        const accessToken = await this.jwtService.sign({ _id, username });

        return { accessToken };
      }
    } catch (error) {
      this.logger.debug(`Cannot refresh token: ${error.toString()}`);
    }

    throw new UnauthorizedException('The refresh token is expired, or it is wrong');
  }
}
