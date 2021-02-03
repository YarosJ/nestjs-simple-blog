import { Model, Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsFilterDto } from './dto/get-posts-filter.dto';
import { UserDocument } from '../auth/schemas/user.schema';

const throwPostNotFoundError = (postId: string|Types.ObjectId): never => {
  throw new NotFoundException(`Post with ID "${postId}" not found`);
};

const userDefaultPopulationConfig = { path: 'user', select: 'username' };

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private readonly postModel: Model<PostDocument>) { }

  /**
   * Fetch posts by filters
   */
  getPosts(
    { text, personal }: GetPostsFilterDto,
    user: UserDocument,
  ): Promise<PostDocument[]> {
    const postsQuery = this.postModel.find();

    if (text) {
      postsQuery.find(
        { $text: { $search: text } },
        { score : { $meta: 'textScore' } },
      );
    }

    if (personal) {
      postsQuery.find({ user: user._id });
    }

    return postsQuery.populate(userDefaultPopulationConfig).exec();
  }

  /**
   * Get a single post
   * @param postId
   * @param user
   */
  async getPost(postId: Types.ObjectId, user: UserDocument): Promise<PostDocument> {
    const foundPost: PostDocument = await this.postModel
      .findById(postId)
      .populate(userDefaultPopulationConfig)
      .exec();

    if (!foundPost || foundPost.user.id !== user.id) {
      throwPostNotFoundError(postId);
    }

    return foundPost;
  }

  /**
   * Post a single post
   * @param createPostDto
   * @param user
   */
  async createPost(
    createPostDto: CreatePostDto,
    user: UserDocument,
  ): Promise<PostDocument> {
    const createdPost: PostDocument = await this.postModel.create(
      { ...createPostDto, user: user._id },
    );

    return createdPost.populate(userDefaultPopulationConfig);
  }

  /**
   * Edit post details
   * @param postId
   * @param createPostDto
   * @param user
   */
  async updatePost(
    postId: Types.ObjectId,
    createPostDto: CreatePostDto,
    user: UserDocument,
  ): Promise<PostDocument> {
    const updatedPost = await this.postModel.findOneAndUpdate(
      { _id: postId, user: user._id },
      createPostDto,
      { new: true },
    );

    if (!updatedPost) {
      throwPostNotFoundError(postId);
    }

    return updatedPost.populate(userDefaultPopulationConfig);
  }

  /**
   * Delete a post
   * @param postId
   * @param user
   */
  async deletePost(postId: Types.ObjectId, user: UserDocument): Promise<void> {
    const deletedPost = await this.postModel.findOneAndDelete(
      { _id: postId, user: user._id},
    );

    if (!deletedPost) {
      throwPostNotFoundError(postId);
    }
  }
}
