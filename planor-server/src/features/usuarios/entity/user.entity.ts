//Se debe importar los decoradores usados en la clase, estos  son esenciales para definir la estructura de la entidad y cómo se mapeará a la base de datos.
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// El decorador `@Entity()` marca la clase `Usuarios` como una entidad de TypeORM. En este caso, se especifica que la tabla se llamará 'Usuarios'.
@Entity({ name: 'Usuarios' })
// La clase `Usuarios` define la estructura de la entidad que representa a la tabla 'Usuarios' en la base de datos.
export class Usuarios {
  //  Cada propiedad de la clase representa una columna en la tabla (las propiedades son: idUsuario, nombreUsuario, apellidoUsuario, email, etc. que son asignadas con name: 'propiedad '). Los decoradores asociados a cada propiedad definen el tipo de dato (como @PrimaryGeneratedColumn, @Column, @CreateDateColumn, @UpdateDateColumn), y se definen las restricciones y otras características.

  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'idUsuario',
    unsigned: true,
  })
  idUsuario!: number;

  @Column({
    name: 'nombreUsuario',
    type: 'varchar',
    length: 100,
  })
  nombreUsuario!: string;

  @Column({
    name: 'apellidoUsuario',
    type: 'varchar',
    length: 100,
  })
  apellidoUsuario!: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email!: string;

  @Column({
    name: 'contrasenaHash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  contrasenaHash?: string | null;

  @Column({
    name: 'usuarioActivo',
    type: 'boolean',
    default: true,
  })
  usuarioActivo!: boolean;

  @Column({
    name: 'rolSistema',
    type: 'enum',
    enum: ['admin', 'usuario'],
    default: 'usuario',
  })
  rolSistema!: 'admin' | 'usuario';

  @CreateDateColumn({
    name: 'fechaRegistro',
    type: 'datetime',
  })
  fechaRegistro!: Date;

  @UpdateDateColumn({
    name: 'fechaActualizacion',
    type: 'datetime',
    nullable: true,
  })
  fechaActualizacion?: Date | null;
}
