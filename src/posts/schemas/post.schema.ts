import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserDocument } from '../../auth/schemas/user.schema';

@Schema()
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: UserDocument;
}

export type PostDocument = Post & Document;

const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ title: 'text', body: 'text' });

export default PostSchema;
