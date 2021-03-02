import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as config from 'config';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const serverConfig = config.get('server');
  const origin = serverConfig.origin || process.env.ORIGIN;

  const app = await NestFactory.create(AppModule);

  if (origin) {
    app.enableCors({ origin });

    logger.log(`Accepting requests from origin "${origin}"`);
  }

  const port = serverConfig.port || process.env.PORT;

  await app.listen(port);

  logger.log(`Application listening on port ${port}`);
}

bootstrap();
