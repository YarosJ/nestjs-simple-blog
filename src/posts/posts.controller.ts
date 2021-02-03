import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Types } from 'mongoose';
import { PostsService } from './posts.service';
import { PostDocument } from './schemas/post.schema';
import { UserDocument } from '../auth/schemas/user.schema';
import { GetPostsFilterDto } from './dto/get-posts-filter.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { GetUser } from '../auth/get-user.decorator';
import { MongooseDocVersionInterceptor } from '../helpers/mongoose-doc-version-interceptor';
import { ObjectIdValidationPipe } from './pipes/object-id-validation.pipe';

@Controller('posts')
@UseGuards(AuthGuard())
@UseInterceptors(MongooseDocVersionInterceptor)
export class PostsController {
  private logger = new Logger('PostsController');

  constructor(private postsService: PostsService) { }

  @Post()
  createPost(
    @Body() createPostDto: CreatePostDto,
    @GetUser() user: UserDocument,
  ): Promise<PostDocument> {
    this.logger.verbose(`User "${user.username}" creating a new task. Data: ${JSON.stringify(createPostDto)}`);

    return this.postsService.createPost(createPostDto, user);
  }

  @Get()
  getPosts(
    @Query(ValidationPipe) filterDto: GetPostsFilterDto,
    @GetUser() user: UserDocument,
  ): Promise<PostDocument[]> {
    this.logger.verbose(
      `User "${user.username}" retrieving the posts. Filters: ${JSON.stringify(filterDto)}`,
    );

    return this.postsService.getPosts(filterDto, user);
  }

  @Get('/:id')
  getPostById(
    @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
    @GetUser() user: UserDocument,
  ): Promise<PostDocument> {
    return this.postsService.getPost(id, user);
  }

  @Patch('/:id')
  updatePost(
    @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
    @Body() updatePostDto: CreatePostDto,
    @GetUser() user: UserDocument,
  ): Promise<PostDocument> {
    return this.postsService.updatePost(id, updatePostDto, user);
  }

  @Delete('/:id')
  deletePost(
    @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
    @GetUser() user: UserDocument,
  ): Promise<void> {
    return this.postsService.deletePost(id, user);
  }
}
