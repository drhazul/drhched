// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CORS desde .env ---
  const origins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins.length ? origins : true,
    credentials: true,
  });

  // --- Prefijo global dinámico ---
  const prefix = (process.env.GLOBAL_PREFIX || '').replace(/^\/+|\/+$/g, ''); // sin slashes
  if (prefix) {
    app.setGlobalPrefix(prefix);
    console.log(`🌐 Prefijo global aplicado: /${prefix}`);
  }

  // --- Swagger ---
  const config = new DocumentBuilder()
    .setTitle('DRH-CHED API')
    .setDescription('API base (Fase 2.1)')
    .setVersion('0.1.0')
    .build();

  const swaggerPath = process.env.API_SWAGGER_PATH || (prefix ? `/${prefix}` : '/api');
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, doc);

  // --- Bind / puerto ---
  const port = Number(process.env.PORT || process.env.API_PORT || 3000);
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);

  const baseUrl = `http://${host}:${port}`;
  console.log(`🚀 API escuchando en ${baseUrl}${prefix ? `/${prefix}` : ''}`);
  console.log(`📜 Swagger en        ${baseUrl}${swaggerPath}`);
}

bootstrap();
