import {
  Post,
  Body,
  Controller,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResourcesService } from './resources.service';
import WithMessageAuthGuard from 'src/helpers/withMessageAuth.guard';
import { ResourceDocument } from './schemas/resource.schema';
import { ObjectIdValidationPipe } from '../helpers/pipes/objectIdValidation.pipe';
import { Types } from 'mongoose';

@Controller('resources')
@UseGuards(WithMessageAuthGuard())
export class ResourcesController {
  private logger = new Logger('ResourcesController');

  constructor(private resourcesService: ResourcesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadResource(
    @UploadedFile() resource,
    @Body('postId', ObjectIdValidationPipe) postId: Types.ObjectId,
  ): Promise<ResourceDocument> {
    this.logger.verbose(
      `Uploading a new resource to the post with ID: ${postId}`,
    );

    return this.resourcesService.createResource(resource, postId);
  }
}
