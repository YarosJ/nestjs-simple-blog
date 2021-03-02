import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDocument } from '../../users/schemas/user.schema';
import { UsersService } from '../../users/users.service';
import JwtPayload from './jwtPayload.interface';
import * as config from 'config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('jwt.secret') || process.env.JWT_SECRET,
    });
  }

  async validate({ username }: JwtPayload): Promise<UserDocument> {
    const user = await this.usersService.getUser({ username });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
