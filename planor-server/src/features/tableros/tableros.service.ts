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
import { ActualizarTableroDto } from './dto/actualizar-tablero.dto';
import { DataSource } from 'typeorm';
import {
  RolEnTablero,
  TablerosUsuarios,
} from './entities/tableros-usuarios.entity';

@Injectable()
export class TablerosService {
  constructor(
    @InjectRepository(Tableros)
    private readonly tablerosRepository: Repository<Tableros>,
    @InjectRepository(Usuarios)
    private readonly usuariosRepository: Repository<Usuarios>,
    @InjectRepository(TablerosUsuarios)
    private readonly tablerosUsuariosRepository: Repository<TablerosUsuarios>,
    private readonly dataSource: DataSource,
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

    // Usar una transacción para asegurar que ambas operaciones (crear tablero y asignar propietario) se completen correctamente
    const tableroGuardado = await this.dataSource.transaction(
      async (manager) => {
        const nuevoTablero = this.tablerosRepository.create(crearTableroDto);
        nuevoTablero.propietario = propietarioEncontrado;

        const saved = await manager.save(nuevoTablero);

        const miembro = this.tablerosUsuariosRepository.create({
          tablero: saved,
          usuario: propietarioEncontrado,
          rolEnTablero: RolEnTablero.PROPIETARIO,
        });
        await manager.save(miembro);

        return saved;
      },
    );

    const tableroConRelaciones = await this.tablerosRepository.findOne({
      where: { idTablero: tableroGuardado.idTablero },
      relations: ['propietario', 'miembros'],
    });
    return tableroConRelaciones as Tableros;
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

  /* ========== EDITAR UN TABLERO ========== */
  /**
   * @param {number} idTablero - ID del tablero a editar.
   * @param {ActualizarTableroDto} actualizarTableroDto - Información actualizada del tablero.
   * @returns {Promise<Tableros>} - Promesa que se resuelve con el tablero actualizado.
   */
  async editarTablero(
    idTablero: number,
    actualizarTableroDto: ActualizarTableroDto,
    idUsuario: number,
  ): Promise<Tableros> {
    const tableroPropio = await this.tablerosRepository.findOne({
      where: { idTablero, propietario: { idUsuario } },
      relations: ['propietario'],
    });
    if (!tableroPropio)
      throw new ForbiddenException(
        'Sólo es posible modificar tableros propios',
      );

    if (actualizarTableroDto.nombreTablero !== undefined) {
      tableroPropio.nombreTablero = actualizarTableroDto.nombreTablero;
    }
    if (actualizarTableroDto.descripcionTablero !== undefined) {
      tableroPropio.descripcionTablero =
        actualizarTableroDto.descripcionTablero;
    }

    const cambios = {
      nombreTablero: actualizarTableroDto.nombreTablero,
      descripcionTablero: actualizarTableroDto.descripcionTablero,
    };
    await this.tablerosRepository.update(idTablero, cambios);
    return this.obtenerDetallesTablero(idTablero, idUsuario);
  }

  /* ========== GESTIONAR USUARIOS DE UN TABLERO ========== */
  /* Permitir al propietario de un tablero gestionar sus integrantes mediante: Invitar usuarios registrados al tablero. Asignarles un rol de acceso (edicionTotal, crearEliminarYMover, soloMover). Eliminar usuarios del tablero (revocar acceso).
La eliminación únicamente revoca el acceso al tablero; no debe eliminar ni modificar tareas ni registros históricos asociados al usuario. La gestión de usuarios es exclusiva del rol propietario.
 Comprobación de validez de las entradas	●	Usuario autenticado mediante JWT válido.
●	Usuario autenticado = tableros.idPropietario.
●	idTablero existe.
●	tableroActivo = true.
●	emailInvitado cumple formato válido.
●	El usuario invitado debe estar registrado en el sistema.
●	rolInvitado ∈ {edicionTotal, crearEliminarYMover, soloMover}.
●	No debe existir ya relación activa en tablerosUsuarios para (idTablero, idUsuario).
●	No debe existir invitación pendiente para el mismo usuario en invitacionesTableros.
●	Para eliminación: Usuario a eliminar ≠ idPropietario.
*/

  // @param {number} idTablero - ID del tablero a editar.
  // @param {ActualizarTableroDto} actualizarTableroDto - Información actualizada del tablero.
  // @returns {Promise<Tableros>} - Promesa que se resuelve con el tablero actualizado.
}
