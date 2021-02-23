import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { ResourcesModule } from './resources/resources.module';
import * as config from 'config';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DB_URI || config.get('db').uri),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
    }),
    AuthModule,
    UsersModule,
    PostsModule,
    ResourcesModule,
  ],
})
export class AppModule {}
