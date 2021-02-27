import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '@nestjs/common';

export default class OptionalUserAuthGuard extends AuthGuard() {
  handleRequest(error, user, info): any {
    if (error) {
      throw error;
    }

    if (info?.name === 'TokenExpiredError') {
      throw new UnauthorizedException('Access token invalid');
    }

    if (user) {
      return user;
    }
  }
}
