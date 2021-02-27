import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ObjectIdValidationPipe implements PipeTransform<any, Types.ObjectId> {
  private readonly isOptional: boolean;

  constructor(isOptional: boolean = false) {
    this.isOptional = isOptional;
  }

  transform(value: any): Types.ObjectId {
    const validObjectId = Types.ObjectId.isValid(value);

    if (!validObjectId) {
      if (this.isOptional) {
        return undefined;
      }

      throw new BadRequestException('Invalid ObjectId');
    }

    return Types.ObjectId.createFromHexString(value);
  }
}
