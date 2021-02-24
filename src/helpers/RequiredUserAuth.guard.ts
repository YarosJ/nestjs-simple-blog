import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export default class RequiredUserAuthGuard extends AuthGuard() {
  handleRequest(error, user): any {
    if (error || !user) {
      throw error || new UnauthorizedException('Access token invalid');
    }

    return user;
  }
}
