import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { UsersService } from './users.service';
import { UserDocument } from './schemas/user.schema';
import { GetUsersFilterDto } from './dto/getUsersFilter.dto';
import { MongooseDocVersionInterceptor } from '../helpers/mongooseDocVersion.interceptor';
import { ObjectIdValidationPipe } from '../helpers/pipes/objectIdValidation.pipe';
import ImplicitParamsValidationPipe from './pipes/implicitParamsValidation.pipe';
import WithMessageAuthGuard from 'src/helpers/withMessageAuth.guard';

@Controller('users')
@UseGuards(WithMessageAuthGuard())
@UseInterceptors(MongooseDocVersionInterceptor)
export class UsersController {
  private logger = new Logger('UsersController');

  constructor(private usersService: UsersService) { }

  @Get()
  getUsers(
    @Query(ImplicitParamsValidationPipe) usersFilterDto: GetUsersFilterDto,
  ): Promise<{ users: UserDocument[], total: number }> {
    this.logger.verbose(
      `Retrieving users. Filters: ${JSON.stringify(usersFilterDto)}`,
    );

    return this.usersService.getUsers(usersFilterDto);
  }

  @Delete('/:id')
  deleteUser(
    @Param('id', ObjectIdValidationPipe) id: Types.ObjectId,
  ): Promise<void> {
    return this.usersService.deleteUser(id);
  }
}
