import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { resolve } from 'path';
import { AuthModule } from '../auth/auth.module';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import ResourcesSchema, { Resource } from './schemas/resource.schema';
import * as config from 'config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Resource.name, schema: ResourcesSchema }]),
    MulterModule.register({ dest: resolve(config.get('uploads.path')) }),
    AuthModule,
  ],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}
