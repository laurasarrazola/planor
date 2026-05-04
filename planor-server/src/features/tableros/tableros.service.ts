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
    // Validar que el propietario exista
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

    const nuevoTablero = this.tablerosRepository.create(crearTableroDto);
    nuevoTablero.propietario = propietario;
    return await this.tablerosRepository.save(nuevoTablero);
  }
}
