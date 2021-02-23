import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from '../auth/auth.module';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import ResourcesSchema, { Resource } from './schemas/resource.schema';
import * as path from 'path';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Resource.name, schema: ResourcesSchema }]),
    MulterModule.register({ dest: path.resolve( 'static/uploads') }),
    AuthModule,
  ],
  controllers: [ResourcesController],
  providers: [ResourcesService],
})
export class ResourcesModule {}
