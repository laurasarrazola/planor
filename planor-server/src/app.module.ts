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
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
      load: [
        () => ({
          /* Configuración específica que puede sobrescribir el archivo .env */
          apiPrefix: process.env.API || '/api/v1',
          nodeEnv: process.env.NODE_ENV || 'development',
        }),
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: typeormConfig,
      inject: [ConfigService],
    }),
    UserModule,
    BoardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
