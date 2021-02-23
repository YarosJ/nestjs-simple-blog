import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Resource, ResourceDocument } from './schemas/resource.schema';

@Injectable()
export class ResourcesService {
  constructor(@InjectModel(Resource.name) private readonly resourceModel: Model<ResourceDocument>) { }

  async createResource({ filename }: any, postId: Types.ObjectId): Promise<ResourceDocument> {
    const createdResource: ResourceDocument = await this.resourceModel.create({
      filename,
      post: postId,
    });

    return createdResource.populate('post', '_id');
  }
}
