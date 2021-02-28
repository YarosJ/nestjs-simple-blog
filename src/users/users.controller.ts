import {
  Controller,
  Get,
  Delete,
  Query,
  Param,
  UseGuards,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';
import implicitQueryParams from 'nestjs-implicit-query-params';
import { UsersService } from './users.service';
import { UserDocument } from './schemas/user.schema';
import { GetUsersFilterDto } from './dto/getUsersFilter.dto';
import { ObjectIdValidationPipe } from '../helpers/pipes/objectIdValidation.pipe';
import RequiredUserAuthGuard from '../helpers/guards/RequiredUserAuth.guard';
import RolesGuard from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { GetUser } from './getUser.decorator';
import { Role } from '../enums/role.enum';

@Roles(Role.Admin)
@Controller('users')
@UseGuards(RequiredUserAuthGuard, RolesGuard)
export class UsersController {
  private logger = new Logger('UsersController');

  constructor(private usersService: UsersService) { }

  @Get()
  getUsers(
    @Query(implicitQueryParams()) usersFilterDto: GetUsersFilterDto,
  ): Promise<{ users: UserDocument[], total: number }> {
    this.logger.verbose(
      `Retrieving users. Filters: ${JSON.stringify(usersFilterDto)}`,
    );

    return this.usersService.getUsers(usersFilterDto);
  }

  @Delete('/:id')
  deleteUser(
    @Param('id', new ObjectIdValidationPipe()) id: Types.ObjectId,
    @GetUser() { _id }: UserDocument,
  ): Promise<void> {
    if (id.equals(_id)) {
      throw new ForbiddenException('User cannot delete himself!');
    }

    return this.usersService.deleteUser(id);
  }
}
