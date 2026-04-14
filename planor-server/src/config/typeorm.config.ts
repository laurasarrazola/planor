import { TypeOrmModuleOptions } from '@nestjs/typeorm'; // Esta importación trae el tipo `TypeOrmModuleOptions` que define la estructura de la configuración que TypeORM espera.
import { ConfigService } from '@nestjs/config'; // Esta importación trae el `ConfigService` que es parte del módulo de configuración de NestJS y se utiliza para acceder a las variables de entorno y otras configuraciones.

// declara y exporta una constante que guarda una función (arrow function)
export const typeormConfig = (
  // Se declaran los parámetros de la función, el parámetro se llama configService y debe ser del tipo ConfigService. se usa para leer variables del .env.
  configService: ConfigService,
  // Indica el tipo de valor que la función debe devolver. debe retornar un objeto con la estructura que espera TypeOrmModuleOptions.
): TypeOrmModuleOptions => {
  return {
    type: 'mysql',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 3306),
    username: configService.get<string>('DB_USER', 'root'),
    //password: '',
    password: configService.get<string>('DB_PASSWORD', ''),
    database: configService.get<string>('DB_NAME', 'planor'),
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
    logging: configService.get<boolean>('DB_LOGGING', true),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
    // ssl: sslConfig ? { rejectUnauthorized: false } : false,
    extra: {},
  };
};
