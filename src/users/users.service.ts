import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schema';
import { UserCredentialsDto } from './dto/userCredentials.dto';
import { GetUsersFilterDto } from './dto/getUsersFilter.dto';
import { GetUserFilterDto } from './dto/getUserFilter.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) { }

  async createUser({ username, password }: UserCredentialsDto): Promise<UserDocument> {
    const salt: string = await bcrypt.genSalt();

    try {
      return await this.userModel.create({
        username,
        salt,
        password: await bcrypt.hash(password, salt),
      });
    } catch (error) {
      if (error.code === 11000) { // Duplicate username
        throw new ConflictException(`Username ${username} already exists`);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  getUser(userFilterDto: GetUserFilterDto): Promise<UserDocument> {
    return this.userModel.findOne(userFilterDto).exec();
  }

  async getUsers(
    {
      pageNumber,
      pageSize,
      sorting,
      username,
    }: GetUsersFilterDto,
  ): Promise<{ users: UserDocument[], total: number }> {
    const usersQuery = this.userModel.find();

    if (username) {
      usersQuery.find(
        { $text: { $search: username } },
        { score : { $meta: 'textScore' } },
      );
    }

    if (sorting) {
      usersQuery.sort({ createdAt: sorting });
    }

    const totalQuery = this.userModel.find().merge(usersQuery).countDocuments();

    if (pageNumber) {
      usersQuery.skip((pageNumber - 1) * (pageSize || 1));
    }

    if (pageSize) {
      usersQuery.limit(pageSize);
    }

    return {
      users: await usersQuery.populate({ path: 'posts', select: 'title' }).exec(),
      total: await totalQuery.exec(),
    };
  }

  async deleteUser(userId: Types.ObjectId): Promise<void> {
    const deletedUser = await this.userModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
  }
}
