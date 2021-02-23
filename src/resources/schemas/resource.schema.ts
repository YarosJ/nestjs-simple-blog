import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { promises } from 'fs';
import { join } from 'path';
import { Logger } from '@nestjs/common';

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

ResourceSchema.pre('deleteMany', async function(next) {
  const resourcesToRemove: ResourceDocument[] = await this.find(this);

  await Promise.all(resourcesToRemove.map(async ({ filename }) => {
    try {
      logger.verbose(`Removing from disk ${filename}`);

      await promises.unlink(join(__dirname, '../../../static/uploads', filename));

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
