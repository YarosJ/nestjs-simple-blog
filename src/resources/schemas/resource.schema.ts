import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Logger } from '@nestjs/common';
import { resolve } from 'path';
import { promises } from 'fs';
import * as config from 'config';

const logger = new Logger('ResourceSchema');

@Schema()
export class Resource {
  @Prop({ required: true })
  filename: string;

  @Prop({ type: Types.ObjectId, ref: 'Post' })
  post: Types.ObjectId;
}

export type ResourceDocument = Resource & Document;

const ResourceSchema = SchemaFactory.createForClass(Resource);

// Removing related files from a disk on resource delete
ResourceSchema.pre('deleteMany', async function(next) {
  const resourcesToRemove: ResourceDocument[] = await this.find(this);

  await Promise.all(resourcesToRemove.map(async ({ filename }) => {
    try {
      await promises.unlink(resolve(config.get('uploads.path'), filename));

      logger.verbose(`Resource: ${filename} removed!`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        return next(error);
      }

      logger.debug(error);
    }
  }));
});

export default ResourceSchema;
