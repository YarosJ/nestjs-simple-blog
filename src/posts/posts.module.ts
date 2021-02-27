import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import PostSchema, { Post } from './schemas/post.schema';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { ResourcesModule } from '../resources/resources.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    ResourcesModule,
    AuthModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
