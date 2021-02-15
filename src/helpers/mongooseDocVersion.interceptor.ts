import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Model } from 'mongoose';

@Injectable()
export class MongooseDocVersionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(responseData => responseData instanceof Model
      ? responseData.toJSON({ versionKey: false }) : responseData),
    );
  }
}
