import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ResourcesService } from '../resources/resources.service';
import { PopulatedPostWithUser, Post, PostDocument } from './schemas/post.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { GetPostsFilterDto } from './dto/getPostsFilter.dto';
import { CreatePostDto } from './dto/createPost.dto';

const throwPostNotFoundError = (postId: string|Types.ObjectId): never => {
  throw new NotFoundException(`Post with ID "${postId}" not found`);
};

const userDefaultPopulationConfig = { path: 'user', select: 'username' };

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly resourcesService: ResourcesService,
  ) {}

  /**
   * Creates a new post
   * @param createPostDto
   * @param user
   * @param resources
   */
  async createPost(
    createPostDto: CreatePostDto,
    user: UserDocument,
    resources: Types.ObjectId[],
  ): Promise<PostDocument> {
    const createdPost: PostDocument = await this.postModel.create(
      { ...createPostDto, user: user._id },
    );

    await this.resourcesService.updateResourcesPost(resources, createdPost._id);

    return createdPost.populate(userDefaultPopulationConfig);
  }

  /**
   * Get a single post by id
   * @param postId
   */
  async getPost(postId: Types.ObjectId): Promise<PopulatedPostWithUser> {
    const foundPost: PopulatedPostWithUser = await this.postModel
      .findById(postId)
      .populate(userDefaultPopulationConfig)
      .exec() as PopulatedPostWithUser;

    if (!foundPost) {
      throwPostNotFoundError(postId);
    }

    return foundPost;
  }

  /**
   * Fetch posts filtered with received criteria
   * @param text
   * @param sorting
   * @param pageNumber
   * @param pageSize
   * @param personal
   * @param user
   * @param userDocument
   */
  async getPosts(
    {
      text,
      sorting,
      pageNumber,
      pageSize,
      personal,
      user,
    }: GetPostsFilterDto,
    userDocument: UserDocument,
  ): Promise<{ posts: PostDocument[], total: number }> {
    const postsQuery = this.postModel.find();
    const userId = personal ? userDocument?._id : user;

    if (userId) {
      postsQuery.find({ user: Types.ObjectId(userId) });
    }

    if (text) {
      postsQuery.find(
        { $text: { $search: text } },
        { score : { $meta: 'textScore' } },
      );
    }

    if (sorting) {
      postsQuery.sort({ createdAt: sorting });
    }

    const totalQuery = this.postModel.find().merge(postsQuery).countDocuments();

    if (pageNumber) {
      postsQuery.skip((pageNumber - 1) * (pageSize || 1));
    }

    if (pageSize) {
      postsQuery.limit(pageSize);
    }

    return {
      total: await totalQuery.exec(),
      posts: await postsQuery
        .populate(userDefaultPopulationConfig)
        .populate('resources').exec(),
    };
  }

  /**
   * Updates post details
   * @param postId
   * @param createPostDto
   * @param user
   * @param resources
   */
  async updatePost(
    postId: Types.ObjectId,
    createPostDto: CreatePostDto,
    user: UserDocument,
    resources: Types.ObjectId[],
  ): Promise<PostDocument> {
    const updatedPost: PostDocument = await this.postModel.findOneAndUpdate(
      { _id: postId, user: user._id },
      createPostDto,
      { new: true },
    );

    if (!updatedPost) {
      throwPostNotFoundError(postId);
    }

    await this.resourcesService.updateResourcesPost(resources, postId);

    return updatedPost.populate(userDefaultPopulationConfig);
  }

  /**
   * Deletes a post found by id and owner
   * @param postId
   * @param user
   */
  async deletePost(postId: Types.ObjectId, user: UserDocument): Promise<void> {
    const deletedPost = await this.postModel.findOneAndDelete(
      { _id: postId, user: user._id },
    );

    if (!deletedPost) {
      throwPostNotFoundError(postId);
    }
  }
}
