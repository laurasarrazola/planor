/* generado automáticamente por NestJS CLI */
    import { Module } from '@nestjs/common';
/* configModule es para manejar variables de entorno y ConfigService para acceder a ellas */
import { ConfigModule, ConfigService } from '@nestjs/config';
/* Integración de TypeORM con NestJS */
import { TypeOrmModule } from '@nestjs/typeorm';
/* generado automáticamente por NestJS CLI */
   import { AppController } from './app.controller';
/* generado automáticamente por NestJS CLI */
   import { AppService } from './app.service';
/* Importa la configuración de TypeORM desde el archivo de configuración */
import { typeormConfig } from './config/typeorm.config';
/* Importa el módulo de usuario, se genera automaticamente al crear el módulo con NestJS CLI */
   import { UserModule } from './features/user/user.module';
/* Importa el módulo de tablero, se genera automaticamente al crear el módulo con NestJS CLI */
   import { BoardModule } from './features/board/board.module';

@Module({
  /* Se debe importar ConfigModule para que las variables de entorno estén disponibles globalmente y TypeOrmModule para la integración con la base de datos. "forRoot" es para configuración síncrona porque solo carga variables de entorno (dotenv) y no necesita operaciones asíncronas ni esperar dependencias externas. Se le pasan opciones estáticas y todo se puede resolver inmediatamente.  "forRootAsync" para configuración asíncrona, porque la configuración de la conexión a la base de datos puede depender de operaciones o servicios que requieren await */
  imports: [
    /* ConfigModule.forRoot carga variables de entorno (dotenv), aplica opciones (isGlobal, envFilePath, load, etc.) y registra el provider ConfigService. */
    ConfigModule.forRoot({
      /* Configura el módulo de configuración para que sea global y cargue variables de entorno desde archivos específicos según el entorno */
      isGlobal: true,
      /* Determina qué archivo .env cargar según el valor de NODE_ENV */
      envFilePath: (() => {
        const env = process.env.NODE_ENV || 'development';
        switch (env) {
          case 'test':
            return '.env.test';
          case 'development':
            return '.env.dev';
          default:
            return '.env.dev';
        }
      })(),
      /* Valores adicionales que se pueden usar en la configuración */
      load: [
        () => ({
          /* Configuración específica que puede sobrescribir el archivo .env */
          /* apiPrefix es el prefijo para las rutas de la API */
          apiPrefix: process.env.API || '/api/v1',
          /* nodeEnv indica el entorno de ejecución (desarrollo, producción, etc.) */
          nodeEnv: process.env.NODE_ENV || 'development',
        }),
      ],
    }),

    /*TypeOrmModule.forRootAsync inicializa TypeORM de forma asíncrona y devuelve un DynamicModule con la conexión a la base de datos. */
    TypeOrmModule.forRootAsync({
      /* Importa ConfigModule para asegurarse de que ConfigService esté disponible */
      imports: [ConfigModule],
      /* Usa la función typeormConfig para obtener la configuración de TypeORM */
      useFactory: typeormConfig,
      /* Inyecta ConfigService para que pueda ser usado en la función useFactory */
      inject: [ConfigService],
    }),
    UserModule,
    BoardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
