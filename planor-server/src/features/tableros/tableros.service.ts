import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CrearTableroDto } from './dto/crear-tablero.dto';
//import { ActualizarTableroDto } from './dto/actualizar-tablero.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tableros } from './entities/tablero.entity';
import {
  EntityManager,
  Repository,
  QueryFailedError,
  DataSource,
} from 'typeorm';
import { Usuarios } from '../usuarios/entity/usuario.entity';
import { ActualizarTableroDto } from './dto/actualizar-tablero.dto';
import {
  RolEnTablero,
  TablerosUsuarios,
} from './entities/tableros-usuarios.entity';
import { InvitarUsuarioDto } from './dto/invitar-usuario.dto';
import {
  InvitacionesTableros,
  EstadoInvitacion,
} from './entities/invitaciones-tableros.entity';
import { ResponderInvitacionDto } from './dto/responder-invitacion.dto';

//Se crean interfaces para definir la estructura de los objetos que se devolverán en las respuestas de las funciones relacionadas con las invitaciones a tableros.
export interface RespuestaInvitacionListadoDto {
  idInvitacionTablero: number;
  idTablero: number;
  nombreTablero: string;
  descripcionTablero?: string | null;
  nombrePropietario: string;
  fechaAsignacion: Date;
  rolInvitado: string;
}

export interface RespuestaAccionInvitacionDto {
  idTableroUsuario?: number | null;
  estadoInvitacion: EstadoInvitacion;
  fechaRespuesta: Date;
}
@Injectable()
export class TablerosService {
  constructor(
    @InjectRepository(Tableros)
    private readonly tablerosRepository: Repository<Tableros>,
    @InjectRepository(Usuarios)
    private readonly usuariosRepository: Repository<Usuarios>,
    @InjectRepository(TablerosUsuarios)
    private readonly tablerosUsuariosRepository: Repository<TablerosUsuarios>,
    @InjectRepository(InvitacionesTableros)
    private readonly invitacionesRepository: Repository<InvitacionesTableros>,
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

  /* ========== INVITAR USUARIOS A UN TABLERO ========== */
  /**
   * @param {number} idTablero - ID del tablero al que se desea invitar al usuario.
   * @param {InvitarUsuarioDto} invitarUsuarioDto - Información del usuario a invitar (email y rol).
   * @returns {Promise<void>} - Promesa que se resuelve cuando la invitación ha sido enviada exitosamente.
   */

  async invitarUsuario(
    idTablero: number,
    dto: InvitarUsuarioDto,
    idSolicitante: number,
  ): Promise<InvitacionesTableros> {
    // comprobar que el tablero existe y está activo
    const tablero = await this.tablerosRepository.findOne({
      where: { idTablero },
    });
    if (!tablero) throw new NotFoundException('Tablero no encontrado');
    if (tablero.tableroActivo === false)
      throw new BadRequestException('Tablero inactivo');

    // comprobar rol del solicitante en el tablero (es propietario o edicionTotal)
    const miembroSolicitante = await this.tablerosUsuariosRepository.findOne({
      where: { tablero: { idTablero }, usuario: { idUsuario: idSolicitante } },
    });
    if (!miembroSolicitante)
      throw new ForbiddenException('No eres miembro del tablero');
    if (
      miembroSolicitante.rolEnTablero !== RolEnTablero.PROPIETARIO &&
      miembroSolicitante.rolEnTablero !== RolEnTablero.EDICION_TOTAL
    ) {
      throw new ForbiddenException('No tienes permisos para invitar usuarios');
    }

    // buscar usuario invitado por email
    const invitado = await this.usuariosRepository.findOne({
      where: { email: dto.emailInvitado },
    });
    if (!invitado) throw new NotFoundException('Email no registrado');

    // comprobar que no sea ya miembro
    const yaEsMiembro = await this.tablerosUsuariosRepository.findOne({
      where: {
        tablero: { idTablero },
        usuario: { idUsuario: invitado.idUsuario },
      },
    });
    if (yaEsMiembro)
      throw new ConflictException('Usuario ya pertenece al tablero');

    // crear invitación en transacción y comprobar invitación pendiente
    const invitacionCreada = await this.dataSource.transaction(
      async (manager: EntityManager) => {
        const invitRepo = manager.getRepository(InvitacionesTableros);

        const pendiente = await invitRepo.findOne({
          where: {
            tablero: { idTablero },
            usuarioInvitado: { idUsuario: invitado.idUsuario },
            estadoInvitacion: EstadoInvitacion.PENDIENTE,
          },
        });
        if (pendiente)
          throw new ConflictException('Invitación pendiente ya existente');

        const invitador = await this.usuariosRepository.findOneBy({
          idUsuario: idSolicitante,
        });
        if (!invitador)
          throw new NotFoundException('Usuario solicitante no encontrado');

        const nueva = invitRepo.create({
          tablero,
          usuarioInvitado: invitado,
          invitadoPor: invitador,
          rolInvitado: dto.rolInvitado,
          estadoInvitacion: EstadoInvitacion.PENDIENTE,
        });
        return await invitRepo.save(nueva);
      },
    );

    // devolver la invitación creada
    return invitacionCreada;
  }

  /* ========== LISTAR INVITACIONES PENDIENTES ========== */
  /**
   * @param {number} idUsuario - ID del usuario para el cual listar invitaciones.
   * @returns {Promise<RespuestaInvitacionListadoDto[]>} - Promesa que se resuelve con la lista de invitaciones pendientes.
   */
  async listarInvitacionesPendientes(
    idUsuario: number,
  ): Promise<RespuestaInvitacionListadoDto[]> {
    // buscar invitaciones pendientes con datos de tablero y propietario
    const invitaciones = await this.invitacionesRepository.find({
      where: {
        usuarioInvitado: { idUsuario },
        estadoInvitacion: EstadoInvitacion.PENDIENTE,
      },
      relations: ['tablero', 'tablero.propietario'],
      order: { fechaAsignacion: 'DESC' },
    });

    // mapear a DTO de respuesta para incluir sólo los datos necesarios. Se construye un nuevo objeto para cada invitación con la información requerida para la respuesta.
    const respuesta: RespuestaInvitacionListadoDto[] = invitaciones.map(
      (inv) => {
        const tablero = inv.tablero;
        const propietario = tablero.propietario;
        return {
          idInvitacionTablero: inv.idInvitacionTablero,
          idTablero: tablero.idTablero,
          nombreTablero: tablero.nombreTablero,
          descripcionTablero: tablero.descripcionTablero ?? null,
          nombrePropietario:
            propietario.nombreUsuario + ' ' + propietario.apellidoUsuario,
          fechaAsignacion: inv.fechaAsignacion,
          rolInvitado: inv.rolInvitado,
        };
      },
    );

    return respuesta;
  }

  /* ========== RESPONDER INVITACIÓN ========== */
  /**
   * @param {number} idInvitacion - ID de la invitación a responder.
   * @param {ResponderInvitacionDto} dto - DTO con la acción a realizar (aceptar o rechazar).
   * @param {number} idUsuario - ID del usuario que responde la invitación (obtenido del token de autenticación).
   */
  async responderInvitacion(
    idInvitacion: number,
    dto: ResponderInvitacionDto,
    idUsuario: number,
  ): Promise<RespuestaAccionInvitacionDto> {
    // comprobar existencia y pertenencia
    const invitacion = await this.invitacionesRepository.findOne({
      where: { idInvitacionTablero: idInvitacion },
      relations: ['tablero', 'usuarioInvitado'],
    });
    if (!invitacion) throw new NotFoundException('Invitación no encontrada');
    if (invitacion.usuarioInvitado.idUsuario !== idUsuario)
      throw new ForbiddenException(
        'La invitación no pertenece al usuario autenticado',
      );
    if (invitacion.estadoInvitacion !== EstadoInvitacion.PENDIENTE)
      throw new ConflictException('La invitación ya fue respondida');

    if (dto.accion === 'aceptar') {
      return await this.aceptarInvitacion(idInvitacion, idUsuario);
    }

    if (dto.accion === 'rechazar') {
      return await this.rechazarInvitacion(invitacion);
    }

    throw new BadRequestException('Acción no válida');
  }

  /* ========== FUNCIONES AUXILIARES PARA RESPONDER INVITACIÓN ========== */
  private async aceptarInvitacion(
    idInvitacion: number,
    idUsuario: number,
  ): Promise<RespuestaAccionInvitacionDto> {
    try {
      return await this.dataSource.transaction<RespuestaAccionInvitacionDto>(
        async (manager: EntityManager) => {
          const invitacionesRepositorio =
            manager.getRepository(InvitacionesTableros);
          const miembrosRepositorio = manager.getRepository(TablerosUsuarios);

          const invitacionTransaccional = await invitacionesRepositorio.findOne(
            {
              where: { idInvitacionTablero: idInvitacion },
              relations: ['tablero', 'usuarioInvitado'],
            },
          );
          if (!invitacionTransaccional)
            throw new NotFoundException(
              'Invitación no encontrada (transacción)',
            );
          if (
            invitacionTransaccional.estadoInvitacion !==
            EstadoInvitacion.PENDIENTE
          )
            throw new ConflictException(
              'La invitación ya fue respondida (transacción)',
            );
          if (invitacionTransaccional.tablero.tableroActivo === false)
            throw new ConflictException('El tablero está inactivo');

          const miembroExistente = await miembrosRepositorio.findOne({
            where: {
              tablero: { idTablero: invitacionTransaccional.tablero.idTablero },
              usuario: { idUsuario },
            },
          });
          if (miembroExistente)
            throw new ConflictException('Usuario ya pertenece al tablero');

          const nuevoMiembro = miembrosRepositorio.create({
            tablero: invitacionTransaccional.tablero,
            usuario: invitacionTransaccional.usuarioInvitado,
            rolEnTablero: invitacionTransaccional.rolInvitado as RolEnTablero,
          });
          const miembroGuardado = await manager.save(nuevoMiembro);

          const fechaRespuesta: Date = new Date();
          invitacionTransaccional.estadoInvitacion = EstadoInvitacion.ACEPTADA;
          invitacionTransaccional.fechaRespuesta = fechaRespuesta;
          await manager.save(invitacionTransaccional);

          return {
            idTableroUsuario: miembroGuardado.idTableroUsuario,
            estadoInvitacion: EstadoInvitacion.ACEPTADA,
            fechaRespuesta,
          };
        },
      );
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException(
          'Error de concurrencia al aceptar la invitación',
        );
      }
      throw error;
    }
  }

  private async rechazarInvitacion(
    invitacion: InvitacionesTableros,
  ): Promise<RespuestaAccionInvitacionDto> {
    const fechaRespuesta: Date = new Date();
    invitacion.estadoInvitacion = EstadoInvitacion.RECHAZADA;
    invitacion.fechaRespuesta = fechaRespuesta;
    const invitacionActualizada =
      await this.invitacionesRepository.save(invitacion);

    return {
      idTableroUsuario: null,
      estadoInvitacion: invitacionActualizada.estadoInvitacion,
      fechaRespuesta,
    };
  }
}
