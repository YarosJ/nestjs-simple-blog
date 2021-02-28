import {
  Controller,
  Post,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResourcesService } from './resources.service';
import { ResourceDocument } from './schemas/resource.schema';
import { ObjectIdValidationPipe } from '../helpers/pipes/objectIdValidation.pipe';
import RequiredUserAuthGuard from '../helpers/guards/RequiredUserAuth.guard';
import RolesGuard from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../enums/role.enum';

@Controller('resources')
@Roles(Role.User, Role.Admin)
@UseGuards(RequiredUserAuthGuard, RolesGuard)
export class ResourcesController {
  private logger = new Logger('ResourcesController');

  constructor(private resourcesService: ResourcesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadResource(
    @UploadedFile() { filename },
    @Body(
      'postId',
      new ObjectIdValidationPipe(true),
    ) post?: Types.ObjectId,
  ): Promise<ResourceDocument> {
    this.logger.verbose('Uploading a new resource');

    return this.resourcesService.createResource({ filename, post });
  }
}
