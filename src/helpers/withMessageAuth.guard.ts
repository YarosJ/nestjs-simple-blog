import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export default (customMessage = 'Access token invalid') => {
  return class WithMessageAuthGuard extends AuthGuard() {
    handleRequest(err, user): any {
      if (err || !user) {
        throw err || new UnauthorizedException(customMessage);
      }

      return user;
    }
  };
};
