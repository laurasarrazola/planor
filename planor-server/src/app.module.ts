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
import { UsuariosModule } from './features/usuarios/usuarios.module';
/* Importa el módulo de tablero, se genera automaticamente al crear el módulo con NestJS CLI */
// import { TablerosModule } from './features/tableros/tableros.module';
import { AuthModule } from './features/auth/auth.module';

/* El decorador @Module() marca una clase como módulo de NestJS y declara su metadato principal: imports, controllers, providers y exports. Sirve para agrupar funcionalidad, definir el alcance del contenedor de inyección de dependencias y exponer servicios entre módulos. */
@Module({
  /* imports es un array que declara qué módulos se cargan para que sus providers/exports estén disponibles */
  imports: [
    /* ConfigModule.forRoot carga variables de entorno (dotenv), aplica opciones (isGlobal, envFilePath, load, etc.) y registra el provider ConfigService. */
    ConfigModule.forRoot({
      /* isGlobal indica si el módulo de configuración está disponible globalmente */
      isGlobal: true,
      /* envFilePath especifica la ruta del archivo de entorno .env a cargar */
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
      /* load es un array de funciones que devuelven objetos de configuración */
      load: [
        () => ({
          /* apiPrefix es el prefijo para las rutas de la API */
          apiPrefix: process.env.API || '/api/v1',
          /* nodeEnv indica el entorno de ejecución (desarrollo, producción, test.) */
          nodeEnv: process.env.NODE_ENV || 'development',
          /* DB_SYNCHRONIZE indica si se sincroniza la base de datos al iniciar la aplicación */
          DB_SYNCHRONIZE:
            (process.env.DB_SYNCHRONIZE || 'false').trim().toLowerCase() ===
            'true',
          /* DB_LOGGING indica si se registran las consultas SQL en la consola */
          DB_LOGGING:
            (process.env.DB_LOGGING || 'false').trim().toLowerCase() === 'true',
        }),
      ],
    }),

    /*TypeOrmModule.forRootAsync configura la conexión a la base de datos al iniciar la app */
    TypeOrmModule.forRootAsync({
      /* Importa (carga) ConfigModule desde @nestjs/config para acceder a ConfigService */
      imports: [ConfigModule],
      /* useFactory especifica la función de configuración de TypeORM, se llama a typeormConfig ya que allí está la configuración de TypeORM en el archivo typeorm.config.ts */
      useFactory: typeormConfig,
      /* inject especifica los servicios que se inyectarán en la función useFactory */
      inject: [ConfigService],
    }),
    /* Importaciones de UsuariosModule y TablerosModule se cargan automáticamente los módulos creados con NestJS CLI */
    UsuariosModule,
    // TablerosModule,
    AuthModule,
  ],
  /* controllers es un array que declara los controladores que se cargan en este módulo, se crea automáticamente al crear el módulo con NestJS CLI */
  controllers: [AppController],
  /* providers es un array que declara los proveedores (servicios, repositorios, etc.) que se cargan en este módulo, se crea automáticamente al crear el módulo con NestJS CLI */
  providers: [AppService],
})
/* Módulo principal de la aplicación: declara una clase llamada AppModule y la exporta para que pueda importarse desde otros archivos. Se crea automáticamente al crear el módulo con NestJS CLI */
export class AppModule {}
