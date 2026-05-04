import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CrearTableroDto } from './dto/crear-tablero.dto';
//import { ActualizarTableroDto } from './dto/actualizar-tablero.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tableros } from './entities/tablero.entity';
import { Repository } from 'typeorm';
import { Usuarios } from '../usuarios/entity/usuario.entity';

@Injectable()
export class TablerosService {
  constructor(
    @InjectRepository(Tableros)
    private readonly tablerosRepository: Repository<Tableros>,
    @InjectRepository(Usuarios)
    private readonly usuariosRepository: Repository<Usuarios>,
  ) {}

  /* ========== CREAR TABLEROS ========== */
  /**
   *  @param {crearTableroDto} crearTableroDto - información del tablero.
   * @returns {Promise<Tableros>}  - Promesa que se resuelve con el tablero creado.
   */

  async crearTablero(
    crearTableroDto: CrearTableroDto,
    idPropietario: number,
  ): Promise<Tableros> {
    const propietario = await this.usuariosRepository.findOneBy({
      idUsuario: idPropietario,
    });
    if (!propietario) {
      throw new NotFoundException('Propietario no encontrado');
    }

    //Validar si ya existe un tablero con el mismo nombre para el mismo usuario propietario
    const tableroExistente = await this.tablerosRepository.findOne({
      where: {
        nombreTablero: crearTableroDto.nombreTablero,
        propietario: { idUsuario: idPropietario },
      },
      relations: ['propietario'],
    });
    if (tableroExistente) {
      throw new BadRequestException('Ya existe un tablero con ese nombre');
    }

    // Crear el nuevo tablero
    const nuevoTablero = this.tablerosRepository.create({
      ...crearTableroDto,
      propietario,
    });
    return await this.tablerosRepository.save(nuevoTablero);
  }

  findAll() {
    return `This action returns all tableros`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tablero`;
  }

  // update(id: number, actualizarTableroDto: ActualizarTableroDto) {
  //   return `This action updates a #${id} tablero`;
  // }

  remove(id: number) {
    return `This action removes a #${id} tablero`;
  }
}

// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Tableros } from './entity/tableros.entity';
// import { Repository } from 'typeorm';
// import { CrearTableroDto } from './dto/crear-tablero.dto';

// @Injectable()
// export class TablerosService {
//   constructor(
//     @InjectRepository(Tableros)
//     private readonly tablerosRepository: Repository<Tableros>,
//   ) {}

//   /* ========== CREAR TABLEROS ========== */
//   /**
//    * @param {CrearTableroDto} CrearTableroDto - información del tablero
//    * @returns {Promise<Tableros>}  - Promesa que se resuelve con el tablero creado
//    */

//   async crearTablero(
//     crearTableroDto: CrearTableroDto,
//     idPropietario: number,
//   ): Promise<Tableros> {
//     const propietario = await this.usuariosRepository.findOneBy({
//       idUsuario: idPropietario,
//     });
//     if (!propietario) {
//       throw new NotFoundException('Propietario no econtrado');
//     }
//     const tablero = this.tablerosRepository.create({
//       nombreTablero: crearTableroDto.nombreTablero,
//       descripcionTablero: crearTableroDto.descripcionTablero,
//       propietario,
//     });
//     const tableroGuardado = await this.tablerosRepository.save(tablero);
//     return tableroGuardado;
//   }
// }
