// DataSource representa la configuración y la conexión a la base de datos; se usa para crear/gestionar la conexión
import { DataSource } from 'typeorm';
//  dotenv carga variables desde un archivo .env al objeto global process.env.
import { config } from 'dotenv';
// Se debe llamar config() antes de usar process.env para que las variables de entorno estén disponibles.
config();

//se definen las variables de entorno necesarias para la conexión a la base de datos.
const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  // 'DB_PASSWORD',
  'DB_NAME',
];

//Recorre el arreglo de variables esperadas en requiredEnvVars y devuelve solo las que faltan en process.env.
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName],
);

//Validación de la variables faltantes y error con la lista de éstas.
if (missingEnvVars.length > 0) {
  throw new Error(
    `Faltan variables de entorno necesarias: ${missingEnvVars.join(', ')}.Por favor, revise su archivo .env y asegúrese de que todas las variables necesarias estén definidas.`,
  );
}

//Crea y exporta una instancia llamada AppDataSource de la clase DataSource (TypeORM). Esa instancia contiene toda la configuración que TypeORM usa para conectarse a la base de datos y localizar entities y migrations.
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});
