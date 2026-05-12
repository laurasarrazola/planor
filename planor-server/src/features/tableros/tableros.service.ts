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
  public async crearTablero(
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
}
