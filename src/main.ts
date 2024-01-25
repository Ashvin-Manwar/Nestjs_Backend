import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { EntityNotFoundErrorFilter } from './school/entity-not-found-error';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,
    // {
    // logger:['error','warn','debug']
  // }
  );
  //use globally
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new EntityNotFoundErrorFilter())

  useContainer(app.select(AppModule),{fallbackOnErrors:true})
  await app.listen(3000);
}
bootstrap();
