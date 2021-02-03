import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import * as config from 'config';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB_URI || config.get('db').uri),
    PostsModule,
    AuthModule,
  ],
})
export class AppModule {}
