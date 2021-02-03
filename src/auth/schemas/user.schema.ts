import * as bcrypt from 'bcryptjs';
import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, hidden: true })
  salt: string;

  @Prop({ type: [Types.ObjectId], ref: 'Post' })
  posts: Types.ObjectId[];

  public async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);

    return hash === this.password;
  }
}

export type UserDocument = User & Document;

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

export default UserSchema;
