import * as bcrypt from 'bcryptjs';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { Role } from '../../enums/role.enum';

const logger = new Logger('UserSchema');

@Schema({
  toJSON: {
    virtuals: true,
    versionKey: false,
  },
})
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, hidden: true })
  salt: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: [Role.User] })
  roles: Role[];

  public async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);

    return hash === this.password;
  }
}

export type UserDocument = User & Document;

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'user',
  justOne: false,
});

UserSchema.index({ username: 'text' });

// Removing user's posts on user delete
UserSchema.pre('findOneAndDelete', async function(next) {
  const user: UserDocument = await this.findOne(this);

  try {
    await user.model('Post').deleteMany(
      { user: user._id },
      null,
    );
  } catch (error) {
    return next(error);
  }

  logger.verbose(
    `Removed Posts related to User with id: ${user._id}`,
  );
});

UserSchema.loadClass(User);

export default UserSchema;
