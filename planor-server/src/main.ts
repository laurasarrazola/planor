// NestFactory crea una instancia de la aplicación Nest, que es el punto de entrada para la aplicación. se genera automaticamente con Nest CLI.
import { NestFactory } from '@nestjs/core';
// ValidationPipe es un pipe global que se utiliza para validar los datos de entrada en las solicitudes HTTP, trabaja de la mano con los DTOs. se añade manualmente en el main.ts para que se aplique a toda la aplicación.
import { ValidationPipe } from '@nestjs/common';
// AppModule es el módulo raíz de la aplicación Nest, que organiza y agrupa los diferentes módulos, controladores y servicios de la aplicación. se genera automaticamente con Nest CLI.
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// La función bootstrap() es la función principal que se ejecuta al iniciar la aplicación.
async function bootstrap() {
  // Crea una instancia de la aplicación Nest utilizando el módulo raíz AppModule (automaticamente generado por Nest CLI).
  const app = await NestFactory.create(AppModule);
  // Usa el ValidationPipe globalmente para validar los datos de entrada en las solicitudes HTTP. Esto asegura que los datos enviados por los clientes cumplan con las reglas de validación definidas en los DTOs.
  app.useGlobalPipes(new ValidationPipe());

  /* Configuración de Swagger para la documentación de la API. */
  //Se crea un documento de Swagger utilizando el DocumentBuilder para definir el título, descripción y versión de la API. Luego, se configura SwaggerModule para servir la documentación en las rutas '/api/docs' y '/api'.
  const config = new DocumentBuilder()
    .setTitle('planor')
    .setDescription('The planor API description')
    .setVersion('1.0')
    //.addTag('usuarios')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory, {
    customSiteTitle: 'Planor API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      docExpansion: 'none',
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      filter: true,
      persistAuthorization: true,
    },
  });
  SwaggerModule.setup('api', app, documentFactory);

  // Inicia el servidor y escucha en el puerto especificado en las variables de entorno (process.env.PORT) o en el puerto 3000 por defecto.
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
