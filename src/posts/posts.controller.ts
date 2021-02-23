import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Types } from 'mongoose';
import * as sanitizeHtml from 'sanitize-html';
import { PostsService } from './posts.service';
import { PopulatedPostWithUser, PostDocument } from './schemas/post.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { GetPostsFilterDto } from './dto/getPostsFilter.dto';
import { CreatePostDto } from './dto/createPost.dto';
import { GetUser } from '../users/getUser.decorator';
import { MongooseDocVersionInterceptor } from '../helpers/mongooseDocVersion.interceptor';
import { ObjectIdValidationPipe } from '../helpers/pipes/objectIdValidation.pipe';
import implicitQueryParams from 'nestjs-implicit-query-params';
import WithMessageAuthGuard from 'src/helpers/withMessageAuth.guard';

const { allowedTags, allowedAttributes } = sanitizeHtml.defaults;

const sanitizeHtmlOptions = {
  allowedTags: [...allowedTags, 'img'],
  allowedAttributes: {
    ...allowedAttributes,
    figure: ['class'],
  },
};

@Controller('posts')
@UseGuards(WithMessageAuthGuard())
@UseInterceptors(MongooseDocVersionInterceptor)
export class PostsController {
  private logger = new Logger('PostsController');

  constructor(private postsService: PostsService) { }

  @Post()
  createPost(
    @Body() { title, body, _id }: CreatePostDto,
    @GetUser() user: UserDocument,
  ): Promise<PostDocument> {
    this.logger.verbose(
      `User "${user.username}" creating a new post. Data: ${JSON.stringify({ title, body })}`,
    );

    return this.postsService.createPost(
      { title, body: sanitizeHtml(body, sanitizeHtmlOptions), _id },
      user,
    );
  }

  @Get()
  getPosts(
    @Query(implicitQueryParams({
      personal: fieldValue => fieldValue === 'true',
    })) filterDto: GetPostsFilterDto,
    @GetUser() user: UserDocument,
  ): Promise<{ posts: PostDocument[], total: number }> {
    this.logger.verbose(
      `User "${user.username}" retrieving the posts. Filters: ${JSON.stringify(filterDto)}`,
    );

    return this.postsService.getPosts(filterDto, user);
  }

  @Get('/newId')
  fetchNewPostId(): Types.ObjectId { return Types.ObjectId(); }

  @Get('/:id')
  getPostById(
    @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
  ): Promise<PopulatedPostWithUser> {
    return this.postsService.getPost(id);
  }

  @Patch('/:id')
  updatePost(
    @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
    @Body() { title, body }: CreatePostDto,
    @GetUser() user: UserDocument,
  ): Promise<PostDocument> {
    return this.postsService.updatePost(
      id,
      { title, body: sanitizeHtml(body, sanitizeHtmlOptions) },
      user,
    );
  }

  @Delete('/:id')
  deletePost(
    @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
    @GetUser() user: UserDocument,
  ): Promise<void> {
    return this.postsService.deletePost(id, user);
  }
}
