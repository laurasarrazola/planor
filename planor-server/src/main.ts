// NestFactory crea una instancia de la aplicación Nest, que es el punto de entrada para la aplicación. se genera automaticamente con Nest CLI.
import { NestFactory } from '@nestjs/core';
// ValidationPipe es un pipe global que se utiliza para validar los datos de entrada en las solicitudes HTTP, trabaja de la mano con los DTOs. se añade manualmente en el main.ts para que se aplique a toda la aplicación.
import { ValidationPipe } from '@nestjs/common';
// AppModule es el módulo raíz de la aplicación Nest, que organiza y agrupa los diferentes módulos, controladores y servicios de la aplicación. se genera automaticamente con Nest CLI.
import { AppModule } from './app.module';

// La función bootstrap() es la función principal que se ejecuta al iniciar la aplicación.
async function bootstrap() {
  // Crea una instancia de la aplicación Nest utilizando el módulo raíz AppModule (automaticamente generado por Nest CLI).
  const app = await NestFactory.create(AppModule);
  // Usa el ValidationPipe globalmente para validar los datos de entrada en las solicitudes HTTP. Esto asegura que los datos enviados por los clientes cumplan con las reglas de validación definidas en los DTOs.
  app.useGlobalPipes(new ValidationPipe());
  // Inicia el servidor y escucha en el puerto especificado en las variables de entorno (process.env.PORT) o en el puerto 3000 por defecto.
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
