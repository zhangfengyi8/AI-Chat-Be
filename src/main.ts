import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import {
  HttpExceptionFilter,
  AllExceptionsFilter,
} from './filters/http-exception.filter';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 配置静态文件服务
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // 全局响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());

  // 跨域
  //   app.enableCors();
  // ✅ 启用 CORS 并设置允许来源
  app.enableCors({
    origin: 'http://localhost:5173', // 或 ['http://localhost:5173']
    credentials: true, // 如果你用 cookie/token 等需加
  });
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
