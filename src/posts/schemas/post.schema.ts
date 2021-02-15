import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import PopulatedDocument from '../../types/PopulatedDocument';
import { UserDocument } from '../../users/schemas/user.schema';

@Schema()
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;
}

export type PostDocument = Post & Document;

export type PopulatedPostWithUser = PopulatedDocument<PostDocument, UserDocument, 'user'>;

const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ title: 'text', body: 'text' });

export default PostSchema;
