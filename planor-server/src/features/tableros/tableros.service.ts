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
