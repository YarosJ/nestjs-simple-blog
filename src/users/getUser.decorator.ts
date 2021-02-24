import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from './schemas/user.schema';

export const GetUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserDocument => {
    const { user } = context.switchToHttp().getRequest();

    return user;
  },
);
