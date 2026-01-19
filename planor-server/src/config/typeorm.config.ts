// Importa el tipo de opciones que espera TypeORM (ayuda con el tipado).
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
// Importa el servicio de configuración de NestJS para leer variables de entorno.
import { ConfigService } from '@nestjs/config';

// Función que construye y devuelve la configuración de TypeORM usando `ConfigService`.
export const typeormConfig = (
  // `configService` permite leer variables de entorno y otros valores de configuración.
  configService: ConfigService,
  // Devuelve un objeto con las opciones de configuración para TypeORM.
): TypeOrmModuleOptions => {
  // Devuelve un objeto con las opciones que TypeORM usará para conectarse a la base de datos, cargar entidades, ejecutar migraciones, etc.
  return {
    type: 'mysql',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 3306),
    username: configService.get<string>('DB_USERNAME', 'root'),
    password: '',
    // password: configService.get<string>('DB_PASSWORD', ''),
    database: configService.get<string>('DB_DATABASE', 'planor'),
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true),
    logging: configService.get<boolean>('DB_LOGGING', true),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
    // ssl: sslConfig ? { rejectUnauthorized: false } : false,
    extra: {},
  };
};
