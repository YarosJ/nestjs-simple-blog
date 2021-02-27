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
import implicitQueryParams from 'nestjs-implicit-query-params';
import { PopulatedPostWithUser, PostDocument } from './schemas/post.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/createPost.dto';
import { GetPostsFilterDto } from './dto/getPostsFilter.dto';
import { GetUser } from '../users/getUser.decorator';
import { Roles } from '../roles/roles.decorator';
import { MongooseDocVersionInterceptor } from '../helpers/mongooseDocVersion.interceptor';
import { ObjectIdValidationPipe } from '../helpers/pipes/objectIdValidation.pipe';
import RequiredUserAuthGuard from '../helpers/RequiredUserAuth.guard';
import OptionalUserAuthGuard from '../helpers/OptionalUserAuth.guard';
import RolesGuard from '../roles/roles.guard';
import { Role } from '../enums/role.enum';

const { allowedTags, allowedAttributes } = sanitizeHtml.defaults;

const sanitizeHtmlOptions = {
  allowedTags: [...allowedTags, 'img'],
  allowedAttributes: {
    ...allowedAttributes,
    figure: ['class'],
  },
};

@Controller('posts')
@UseInterceptors(MongooseDocVersionInterceptor)
export class PostsController {
  private logger = new Logger('PostsController');

  constructor(private postsService: PostsService) { }

  @Post()
  @Roles(Role.User, Role.Admin)
  @UseGuards(RequiredUserAuthGuard, RolesGuard)
  createPost(
    @Body() { title, body, resources }: CreatePostDto,
    @GetUser() user: UserDocument,
  ): Promise<PostDocument> {
    this.logger.verbose(
      `User "${user.username}" creating a new post. Data: ${JSON.stringify({ title, body })}`,
    );

    return this.postsService.createPost(
      { title, body: sanitizeHtml(body, sanitizeHtmlOptions) },
      user,
      resources,
    );
  }

  @Get()
  @UseGuards(OptionalUserAuthGuard)
  getPosts(
    @Query(implicitQueryParams({
      personal: fieldValue => fieldValue === 'true',
    })) filterDto: GetPostsFilterDto,
    @GetUser() user: UserDocument,
  ): Promise<{ posts: PostDocument[], total: number }> {
    this.logger.verbose(
      `Retrieving the posts. Filters: ${JSON.stringify(filterDto)}`,
    );

    return this.postsService.getPosts(filterDto, user);
  }

  @Get('/newId')
  @Roles(Role.User, Role.Admin)
  @UseGuards(RequiredUserAuthGuard, RolesGuard)
  fetchNewPostId(): Types.ObjectId { return Types.ObjectId(); }

  @Get('/:id')
  getPostById(
    @Param('id', new ObjectIdValidationPipe()) id: Types.ObjectId,
  ): Promise<PopulatedPostWithUser> {
    return this.postsService.getPost(id);
  }

  @Patch('/:id')
  @Roles(Role.User, Role.Admin)
  @UseGuards(RequiredUserAuthGuard, RolesGuard)
  updatePost(
    @Param('id', new ObjectIdValidationPipe()) id: Types.ObjectId,
    @Body() { title, body, resources }: CreatePostDto,
    @GetUser() user: UserDocument,
  ): Promise<PostDocument> {
    return this.postsService.updatePost(
      id,
      { title, body: sanitizeHtml(body, sanitizeHtmlOptions) },
      user,
      resources,
    );
  }

  @Delete('/:id')
  @Roles(Role.User, Role.Admin)
  @UseGuards(RequiredUserAuthGuard, RolesGuard)
  deletePost(
    @Param('id', new ObjectIdValidationPipe()) id: Types.ObjectId,
    @GetUser() user: UserDocument,
  ): Promise<void> {
    return this.postsService.deletePost(id, user);
  }
}
