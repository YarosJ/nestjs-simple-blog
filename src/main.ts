import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as config from 'config';

async function bootstrap() {
  const serverConfig = config.get('server');
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  const corsConfig = serverConfig.cors;

  if (corsConfig) {
    logger.log(`Accepting requests from origin "${corsConfig.origin}"`);
  }

  app.enableCors(corsConfig);

  const port = process.env.PORT || serverConfig.port;

  await app.listen(port);

  logger.log(`Application listening on port ${port}`);
}

bootstrap();
