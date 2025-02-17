import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Callback, Context, Handler } from 'aws-lambda';
import { configure } from '@codegenie/serverless-express';

let server: Handler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const expressHandler = app.getHttpAdapter().getInstance();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return configure({ app: expressHandler });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return server(event, context, callback);
};
