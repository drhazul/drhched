"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const origins = (process.env.CORS_ORIGINS || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    app.enableCors({
        origin: origins.length ? origins : true,
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('DRH-CHED API')
        .setDescription('API base (Fase 2.1)')
        .setVersion('0.1.0')
        .build();
    const doc = swagger_1.SwaggerModule.createDocument(app, config);
    const swaggerPath = process.env.API_SWAGGER_PATH || '/api';
    swagger_1.SwaggerModule.setup(swaggerPath, app, doc);
    const port = Number(process.env.PORT || process.env.API_PORT || 3000);
    const host = process.env.HOST || '0.0.0.0';
    await app.listen(port, host);
    console.log(`🚀 API escuchando en http://${host}:${port}${swaggerPath}`);
}
bootstrap();
//# sourceMappingURL=main.js.map