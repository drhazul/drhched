import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CORS dinámico desde .env ---
  // Ejemplo en .env.prod:
  // CORS_ORIGINS=http://192.168.200.212:3000,http://localhost:5173
  const origins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins.length ? origins : true,
    credentials: true,
  });

  // --- Swagger ---
  const config = new DocumentBuilder()
    .setTitle('DRH-CHED API')
    .setDescription('API base (Fase 2.1)')
    .setVersion('0.1.0')
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  const swaggerPath = process.env.API_SWAGGER_PATH || '/api';
  SwaggerModule.setup(swaggerPath, app, doc);

  // --- Bind en 0.0.0.0 y puerto de entorno ---
  const port = Number(process.env.PORT || process.env.API_PORT || 3000);
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);

  console.log(`🚀 API escuchando en http://${host}:${port}${swaggerPath}`);
}

bootstrap();
