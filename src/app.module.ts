import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import * as config from 'config';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB_URI || config.get('db').uri),
    AuthModule,
    UsersModule,
    PostsModule,
  ],
})
export class AppModule {}
