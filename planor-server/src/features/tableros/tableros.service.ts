import {
  BadRequestException,
  ForbiddenException,
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
    idSolicitante: number,
  ): Promise<Tableros> {
    const propietarioEncontrado: Usuarios | null =
      await this.usuariosRepository.findOneBy({ idUsuario: idSolicitante });
    if (!propietarioEncontrado) {
      throw new NotFoundException(
        'Propietario (usuario autenticado) no encontrado',
      );
    }

    const tableroExistente: Tableros | null =
      await this.tablerosRepository.findOne({
        where: {
          nombreTablero: crearTableroDto.nombreTablero,
          propietario: { idUsuario: idSolicitante },
        },
      });
    if (tableroExistente) {
      throw new BadRequestException(
        'Ya existe un tablero con ese nombre para este usuario',
      );
    }

    const nuevoTablero: Tableros =
      this.tablerosRepository.create(crearTableroDto);
    nuevoTablero.propietario = propietarioEncontrado;
    return await this.tablerosRepository.save(nuevoTablero);
  }

  /* ========== OBTENER TABLEROS ========== */
  /**
   * @param {void} - No recibe parámetros.
   * @returns {Promise<Tableros[]>} - Promesa que se resuelve con un array de tableros.
   */
  async obtenerTableros(): Promise<Tableros[]> {
    return await this.tablerosRepository.find({ relations: ['propietario'] });
  }

  /* ========== OBTENER TABLEROS POR PROPIETARIO ========== */
  /**
   * @param {number} idPropietario - ID del propietario de los tableros obtenido desde el token de autenticación.
   * @return {Promise<Tableros>} - Promesa que se resuelve con el tablero encontrado.
   */
  async obtenerTablerosUsuario(idPropietario: number): Promise<Tableros[]> {
    return await this.tablerosRepository.find({
      where: { propietario: { idUsuario: idPropietario } },
      relations: ['propietario'],
    });
  }

  /* ========== OBTENER DETALLES DE UN TABLERO ========== */
  /**
   * @param {number} idTablero - ID del tablero a obtener.
   * @returns {Promise<Tableros>} - Promesa que se resuelve con el tablero encontrado.
   */
  async obtenerDetallesTablero(
    idTablero: number,
    idUsuario: number,
  ): Promise<Tableros> {
    const tableroPropio = await this.tablerosRepository.findOne({
      where: { idTablero, propietario: { idUsuario } },
      relations: ['propietario'],
    });
    if (tableroPropio) return tableroPropio;

    // si no es propietario, verificar si el tablero existe
    const existe = await this.tablerosRepository.findOne({
      where: { idTablero },
    });
    if (!existe) throw new NotFoundException('Tablero no encontrado');

    // existe pero no es propietario
    throw new ForbiddenException('No tienes permiso para ver este tablero');
  }
}
