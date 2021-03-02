import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { ResourcesModule } from './resources/resources.module';
import * as config from 'config';

const { dbName, url } = config.get('db');

@Module({
  imports: [
    ServeStaticModule.forRoot({ rootPath: resolve('static') }),
    MongooseModule.forRoot(
      url || `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${dbName}`,
    ),
    AuthModule,
    UsersModule,
    PostsModule,
    ResourcesModule,
  ],
})
export class AppModule {}
