import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

let cachedApp: ReturnType<typeof NestFactory.create> extends Promise<infer T> ? T : never;

async function bootstrap() {
  if (cachedApp) return cachedApp;
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');

  if (process.env['VERCEL']) {
    // Vercel serverless: initialise without listening on a port
    await app.init();
  } else {
    const port = process.env['PORT'] ?? 3000;
    await app.listen(port);
  }

  cachedApp = app;
  return app;
}

bootstrap();

// Export for Vercel Serverless Function handler
export { bootstrap };
