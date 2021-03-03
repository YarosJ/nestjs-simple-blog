import { DocumentDefinition, Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schema';
import { UserCredentialsDto } from './dto/userCredentials.dto';
import { GetUsersFilterDto } from './dto/getUsersFilter.dto';
import { GetUserFilterDto } from './dto/getUserFilter.dto';
import { Role } from '../enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Creates a new user with received credentials
   * @param username
   * @param password
   */
  async createUser(
    { username, password }: UserCredentialsDto,
  ): Promise<UserDocument> {
    const salt: string = await bcrypt.genSalt();
    const newUserData: Partial<DocumentDefinition<UserDocument>> = {
      username,
      salt,
      password: await bcrypt.hash(password, salt),
    };

    if (!await this.userModel.count({})) {
      newUserData.roles = [Role.Admin];
    }

    try {
      return await this.userModel.create(newUserData);
    } catch (error) {
      if (error.code === 11000) { // Duplicate username
        throw new ConflictException(`Username ${username} already exists`);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  /**
   * Get a single user by id
   * @param userFilterDto
   */
  getUser(userFilterDto: GetUserFilterDto): Promise<UserDocument> {
    return this.userModel.findOne(userFilterDto).exec();
  }

  /**
   * Fetch users filtered with received criteria
   * @param pageNumber
   * @param pageSize
   * @param sorting
   * @param username
   */
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
      total: await totalQuery.exec(),
      users: await usersQuery.populate(
        { path: 'posts', select: 'title' },
      ).exec(),
    };
  }

  /**
   * Deletes user by id
   * @param userId
   */
  async deleteUser(userId: Types.ObjectId): Promise<void> {
    const session = await this.userModel.startSession();

    // NOTE: There is no sense to use a transaction for such a case
    // (here it is used just for example)
    await session.withTransaction(async () => {

      /*
       Here can be added operation which can fault
       Operations will be undone on error
      */

      const deletedUser = await this.userModel.findByIdAndDelete(userId);

      if (!deletedUser) {
        throw new NotFoundException(`User with ID "${userId}" not found`);
      }
    });

    session.endSession();
  }
}
