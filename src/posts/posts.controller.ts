import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';
import * as sanitizeHtml from 'sanitize-html';
import implicitQueryParams from 'nestjs-implicit-query-params';
import sanitizeHtmlConfig from './sanitizeHtmlConfig';
import { PopulatedPostWithUser, PostDocument } from './schemas/post.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/createPost.dto';
import { GetPostsFilterDto } from './dto/getPostsFilter.dto';
import { GetUser } from '../users/getUser.decorator';
import { Roles } from '../roles/roles.decorator';
import { ObjectIdValidationPipe } from '../helpers/pipes/objectIdValidation.pipe';
import RequiredUserAuthGuard from '../helpers/guards/RequiredUserAuth.guard';
import OptionalUserAuthGuard from '../helpers/guards/OptionalUserAuth.guard';
import RolesGuard from '../roles/roles.guard';
import { Role } from '../enums/role.enum';

@Controller('posts')
export class PostsController {
  private logger = new Logger('PostsController');

  constructor(private postsService: PostsService) { }

  @Post()
  @Roles(Role.User, Role.Admin)
  @UseGuards(RequiredUserAuthGuard, RolesGuard)
  createPost(
    @Body() {
      title,
      body,
      resources,
    }: CreatePostDto,
    @GetUser() user: UserDocument,
  ): Promise<PostDocument> {
    this.logger.verbose(
      `User "${user.username}" creating a new post. Data: ${JSON.stringify({ title, body })}`,
    );

    return this.postsService.createPost(
      { title, body: sanitizeHtml(body, sanitizeHtmlConfig) },
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
    @Body() {
      title,
      body,
      resources,
    }: CreatePostDto,
    @GetUser() user: UserDocument,
  ): Promise<PostDocument> {
    return this.postsService.updatePost(
      id,
      { title, body: sanitizeHtml(body, sanitizeHtmlConfig) },
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
