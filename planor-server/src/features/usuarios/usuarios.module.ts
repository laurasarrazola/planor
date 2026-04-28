// Importa el decorador Module de @nestjs/common; es necesario para definir un módulo en NestJS y se añade automáticamente el CLI al crear un módulo.
import { Module } from '@nestjs/common';

//Importa TypeOrmModule de @nestjs/typeorm; es la integración de TypeORM en NestJS. Sirve para configurar la conexión a la BD y registrar entidades, repositorios y otros componentes en el módulo.
import { TypeOrmModule } from '@nestjs/typeorm';

// Importa la entidad Usuarios desde user.entity.ts. Representa la estructura de la tabla usuarios y define cómo se almacenan y gestionan los datos en la base de datos.
import { Usuarios } from './entity/usuario.entity';

// Importa el controlador UsuariosController desde usuarios.controller.ts, este define rutas y la lógica para manejar solicitudes HTTP (crear, leer, actualizar, eliminar).
import { UsuariosController } from './usuarios.controller';

// Importa el servicio UsuariosService desde usuarios.service.ts, este contiene la lógica de negocio para gestionar usuarios, como operaciones CRUD y otras funcionalidades.
import { UsuariosService } from './usuarios.service';

// @Module() marca la clase UsuariosModule como módulo de NestJS. El objeto pasado configura imports, controllers, providers y exports, definiendo dependencias y qué servicios exporta a otros módulos.
@Module({
  // Imports son módulos necesarios. TypeOrmModule.forFeature([Usuarios]) registra la entidad en el módulo para inyectar su repositorio y usar TypeORM.
  imports: [TypeOrmModule.forFeature([Usuarios])],
  // Los providers son los servicios que se pueden inyectar en otros componentes del módulo.
  providers: [UsuariosService],
  // Los controllers manejan las rutas HTTP. Aquí se registra UsuariosController para gestionar las solicitudes relacionadas con usuarios.
  controllers: [UsuariosController],
  // Los exports son los servicios que este módulo hace disponibles para otros módulos. se exporta UsuariosService para que otros módulos puedan inyectarlo y usar su funcionalidad.
  exports: [UsuariosService],
})
export class UsuariosModule {}
