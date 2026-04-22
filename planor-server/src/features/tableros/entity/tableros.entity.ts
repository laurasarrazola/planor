import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { Usuarios } from '../../usuarios/entity/usuario.entity';

@Entity({ name: 'tableros' })
export class Tableros {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'idTablero',
    unsigned: true,
  })
  idTablero!: number;

  //@ManyToOne es una relación de muchos a uno.Indica que muchos tableros pertenecen a un usuario. La función flecha "() => Usuarios" evita problemas de orden de imports. nullable: false indica que la columna de FK no puede ser NULL
  @ManyToOne(() => Usuarios, { nullable: false })
  // @JoinColumn le dice a TypeORM el nombre físico de la columna FK en la tabla.
  @JoinColumn({ name: 'idPropietario' })
  propietario!: Usuarios;

  //Indica a TypeORM que cree y mantenga automáticamente una propiedad con el id de la relación (FK) basada en la propiedad propietario.
  @RelationId((tablero: Tableros) => tablero.propietario)
  idPropietario!: number;

  @Column({
    name: 'nombreTablero',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  nombreTablero!: string;

  @Column({
    name: 'descripcionTablero',
    type: 'text',
    nullable: true,
  })
  descripcionTablero?: string | null;

  @Column({
    name: 'tableroActivo',
    type: 'boolean',
    default: true,
  })
  tableroActivo!: boolean;

  @CreateDateColumn({
    name: 'fechaCreacionTablero',
    type: 'datetime',
  })
  fechaCreacionTablero!: Date;

  @UpdateDateColumn({
    name: 'fechaActualizacionTablero',
    type: 'datetime',
    nullable: true,
  })
  fechaActualizacionTablero?: Date | null;
}
