/* eslint-disable prettier/prettier */
// Injectable: Marca el servicio como inyectable. BadRequestException: lanza error HTTP 400 cuando un dato es inválido. NotFoundException: lanza error HTTP 404 cuando un recurso no se encuentra.
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

// import * as bcrypt importa todas las funciones de bcrypt bajo el namespace bcrypt.
import * as bcrypt from 'bcrypt';

// Inyecta el repositorio TypeORM para acceder e interactuar con la bd a traves de la entidad.
import { InjectRepository } from '@nestjs/typeorm';

// La clase Repository ejecuta CRUD y consultas sobre la entidad.
import { Repository } from 'typeorm';

// La entidad le indica al servicio la estructura de datos con la que va a trabajar.
import { Usuarios } from './entity/usuario.entity';

//el DTO le indica al servicio qué datos llegarán y cómo deben ser procesados.
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ObtenerUsuariosDto } from './dto/obtener-usuarios.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { CambiarContrasenaDto } from './dto/cambiar-contrasena.dto';
import { EliminarUsuarioDto } from './dto/eliminar-usuario.dto';

// @Injectable() marca la clase para la inyección de dependencias, se crea automáticamente con el CLI.
@Injectable()

// UsuariosService es el servicio que contiene toda la lógica para gestionar usuarios.
export class UsuariosService {
  //Constructor: inyecta el repositorio Usuarios (TypeORM) para operaciones DB
  constructor(
    // Se inyecta el repositorio de la entidad Usuarios usando @InjectRepository.
    @InjectRepository(Usuarios)
    private readonly usuariosRepository: Repository<Usuarios>,
  ) { }

  /* ========== CREAR USUARIO ========== */
  /**
   * Crea un nuevo usuario en el sistema usando el modelo de datos del DTO.
   * @param {CrearUsuarioDto} crearUsuarioDto - información del usuario
   * @returns {Promise<Usuarios>} - Promesa que se resuelve con el usuario creado.
   */

  //crearUsuario recibe el DTO y devuelve una promesa que se resuelve con el usuario creado.
  async crearUsuario(crearUsuarioDto: CrearUsuarioDto): Promise<Usuarios> {
    // Validar que el email no esté previamente registrado
    const usuarioExistente = await this.usuariosRepository.findOneBy({
      email: crearUsuarioDto.email,
    });
    if (usuarioExistente) {
      throw new BadRequestException(
        'Ya existe un usuario con el email ingresado',
      );
    }

    // Validar que la contraseña y la confirmación coincidan
    if (crearUsuarioDto.contrasena !== crearUsuarioDto.confirmarContrasena) {
      throw new BadRequestException(
        'La contraseña y la confirmación no coinciden',
      );
    }

    // Hashea la contraseña 
    const hashed = await bcrypt.hash(crearUsuarioDto.contrasena, 10);

    // Crea una nueva instancia de la entidad Usuarios con el método create() de TypeORM.
    const usuarioNuevo = this.usuariosRepository.create({
      nombreUsuario: crearUsuarioDto.nombreUsuario,
      apellidoUsuario: crearUsuarioDto.apellidoUsuario,
      email: crearUsuarioDto.email,
      contrasena: hashed,
    });

    // Guarda el nuevo usuario en la base de datos con el método save() de TypeORM. Luego, se desestructura el objeto guardado para eliminar la contraseña antes de devolverlo.
    const usuarioGuardado = await this.usuariosRepository.save(usuarioNuevo);
    return {
  idUsuario: usuarioGuardado.idUsuario,
  nombreUsuario: usuarioGuardado.nombreUsuario,
  apellidoUsuario: usuarioGuardado.apellidoUsuario,
  email: usuarioGuardado.email,
  fechaRegistro: usuarioGuardado.fechaRegistro,
  usuarioActivo: usuarioGuardado.usuarioActivo,
  rolSistema: usuarioGuardado.rolSistema
};
  }

  /* ========== OBTENER USUARIOS ========== */
  /**
   * Método para obtener todos los usuarios del sistema.
   * @param {void} - No recibe parámetros.
   * @returns {Promise<Usuarios[]>} - Promesa que resuelve con un array de usuarios.
   */

  /* Obtiene con find() de usuariosRepository los datos de la bd, no se incluye la contraseña en el select */
  async obtenerUsuarios(): Promise<Usuarios[]> {
    const usuariosObtenidos = await this.usuariosRepository.find({
      select: [
        'idUsuario',
        'nombreUsuario',
        'apellidoUsuario',
        'email',
        'usuarioActivo',
        'rolSistema',
        'fechaRegistro',
        'fechaActualizacion',
      ],
    });
    return usuariosObtenidos;
  }

  /* ========== OBTENER USUARIOS POR ID ========== */
  /**
   * Método para obtener un usuario por su ID.
   * @param {number} id - ID del usuario a obtener.
   * @returns {Promise<Usuarios>} - Promesa que resuelve con el usuario encontrado.
   */
  async obtenerUsuarioPorId(id: number): Promise<Usuarios> {
    const usuarioObtenido = await this.usuariosRepository.findOne({
      where: { idUsuario: id },
      select: [
        'idUsuario',
        'nombreUsuario',
        'apellidoUsuario',
        'email',
        'usuarioActivo',
        'rolSistema',
        'fechaRegistro',
        'fechaActualizacion',
      ],
    });
    if (!usuarioObtenido) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuarioObtenido;
  }

  /* ========== OBTENER USUARIOS CON FILTROS (QUERY PARAMS) ========== */
  /**
   * Método para obtener usuarios con filtros (Query Params)
   * @param {ObtenerUsuariosDto} filtros - DTO con los filtros para la consulta.
   * @returns {Promise<Usuarios[]>} - Promesa que resuelve con array de usuarios que cumplen los filtros.
   */

  //La función obtenerUsuariosConFiltros recibe la estructura de obtenerUsuariosDto a través de la variable 'filtros' para la consulta y devuelve una promesa que resuelve con un array de usuarios que cumplen los filtros.
  async obtenerUsuariosConFiltros(filtros: ObtenerUsuariosDto): Promise<Usuarios[]> {
    //constructorConsulta es un objeto dinámico que arma condiciones según filtros usando QueryBuilder de TypeORM para generar SQL.
    const constructorConsulta = this.usuariosRepository
      // .createQueryBuilder inicia la consulta con el alias 'usuario'.
      // .select() define los campos a seleccionar en la consulta
      .createQueryBuilder('usuario')
      .select([
        'usuario.idUsuario',
        'usuario.nombreUsuario',
        'usuario.apellidoUsuario',
        'usuario.email',
        'usuario.usuarioActivo',
        'usuario.rolSistema',
        'usuario.fechaRegistro',
        'usuario.fechaActualizacion',
      ]);

      // Si el DTO tiene un valor en 'busqueda', se agrega una condición que busca coincidencias en nombreUsuario, apellidoUsuario o email usando LIKE.
    if (filtros.busqueda) {
      constructorConsulta.andWhere(
        `(CONCAT(COALESCE(usuario.nombreUsuario , ''), ' ', COALESCE(usuario.apellidoUsuario, '')) LIKE :search OR usuario.email LIKE :search)`,
        { search: `%${filtros.busqueda}%` },
      );
    }

    // usuarioActivo
    if (filtros.usuarioActivo) {
      constructorConsulta.andWhere('usuario.usuarioActivo = :activo', {
        activo: filtros.usuarioActivo === 'activo',
      });
    }

    // rol
    if (filtros.rolSistema) {
      constructorConsulta.andWhere('usuario.rolSistema = :rol', {
        rol: filtros.rolSistema,
      });
    }

    // fechas
    if (filtros.fechaRegistro) {
      constructorConsulta.andWhere('usuario.fechaRegistro >= :desde', {
        desde: filtros.fechaRegistro,
      });
    }
    if (filtros.fechaActualizacion) {
      constructorConsulta.andWhere('usuario.fechaActualizacion <= :hasta', {
        hasta: filtros.fechaActualizacion,
      });
    }

    // Ejecuta la consulta con getMany() y devuelve el resultado.
    return await constructorConsulta.getMany();
  }

  /* ========== ACTUALIZAR USUARIO ========== */
  /**
   * Método para actualizar un usuario existente.
   * @param {number} id - ID del usuario a actualizar.
   * @param {ActualizarUsuarioDto} actualizarUsuarioDto - DTO con los datos a actualizar.
   * @returns {Promise<Usuarios>} - Promesa que resuelve con el usuario actualizado.
   */

  async actualizarUsuario( id: number, actualizarUsuarioDto: ActualizarUsuarioDto,): Promise<Usuarios> {
    // Busca el usuario por ID con findOneBy(). Si no se encuentra, lanza NotFoundException.
    const usuarioAActualizar = await this.usuariosRepository.findOneBy({ idUsuario: id });
    if (!usuarioAActualizar) throw new NotFoundException('Usuario no encontrado');

    // Actualiza solo los campos que se proporcionan en el DTO. Si a un campo no se le proporciona un valor, se mantiene el valor actual.
    if (typeof actualizarUsuarioDto.nombreUsuario !== 'undefined') {
      usuarioAActualizar.nombreUsuario = actualizarUsuarioDto.nombreUsuario!;
    }
    if (typeof actualizarUsuarioDto.apellidoUsuario !== 'undefined') {
      usuarioAActualizar.apellidoUsuario = actualizarUsuarioDto.apellidoUsuario!;
    }

    // Guarda el usuario actualizado en la base de datos con save(). Luego, se desestructura el objeto guardado para eliminar la contraseña antes de devolverlo.

const usuarioActualizado = await this.usuariosRepository.save(usuarioAActualizar);
    return {
  idUsuario: usuarioActualizado.idUsuario,
  nombreUsuario: usuarioActualizado.nombreUsuario,
  apellidoUsuario: usuarioActualizado.apellidoUsuario,
  email: usuarioActualizado.email,
  fechaRegistro: usuarioActualizado.fechaRegistro,
  usuarioActivo: usuarioActualizado.usuarioActivo,
  rolSistema: usuarioActualizado.rolSistema
};
    // const usuarioActualizado = await this.usuariosRepository.save(usuarioAActualizar);
    // const { contrasena: _contrasena, ...sanitized } = usuarioActualizado;
    // void _contrasena;
    // // Devuelve el usuario actualizado sin la contraseña.
    // return sanitized as Usuarios;
  }

  /* ========== CAMBIAR CONTRASEÑA DE USUARIO ========== */
  /**
   * Método para cambiar la contraseña de un usuario.
   * @param {number} id - ID del usuario cuya contraseña se va a cambiar.
   * @param {CambiarContrasenaDto} cambiarContrasenaDto - DTO con la contraseña actual, nueva contraseña y confirmación de nueva contraseña.
   * @returns {Promise<void>} - Promesa que se resuelve cuando la contraseña ha sido cambiada exitosamente.
   */

  async cambiarContrasena(id: number, dto: CambiarContrasenaDto): Promise<Usuarios> {
    //findOne es un método de TypeORM que busca un registro específico. where filtra un usuario cuyo campo idUsuario sea igual a id y select especifica que campos del usuario se deben devolver.
    const usuarioActualizarContrasena = await this.usuariosRepository.findOne({ where: { idUsuario: id }, select: ['idUsuario', 'contrasena'], });
    // Manejo si no se encuentra el usuario con la id proporcionada.
    if (!usuarioActualizarContrasena) {
      throw new NotFoundException('Usuario no encontrado');
    }
    // Manejo si el usuario no tiene contraseña almacenada (puede ser null o undefined).
    if (!usuarioActualizarContrasena.contrasena) {
      throw new BadRequestException('No hay contraseña almacenada para este usuario');
    }
    // bcrypt.compare() compara la contraseña actual (dto.contrasenaActual) con el hash almacenado en la base de datos (usuario.contrasena) y maneja el error.
    const coincide = await bcrypt.compare(dto.contrasenaActual, usuarioActualizarContrasena.contrasena);
    if (!coincide) { throw new BadRequestException('Contraseña actual incorrecta'); }
    // Manejo si la nueva contraseña y la confirmación no coinciden.
    if (dto.contrasenaNueva !== dto.confirmarContrasenaNueva) {
      throw new BadRequestException('La nueva contraseña y la confirmación no coinciden, debes ser iguales');
    }
    // Si todo es correcto, se hashea la nueva contraseña y se actualiza el campo contrasena del usuario. Luego, se guarda el usuario actualizado en la base de datos con save() y se devuelve el usuario actualizado sin la contraseña.
    usuarioActualizarContrasena.contrasena = await bcrypt.hash(dto.contrasenaNueva, 10);
    // const saved = await this.usuariosRepository.save(usuarioActualizarContrasena);
    // const { contrasena, ...sanitized } = saved;
    // void contrasena;
    // return sanitized as Usuarios;

const contrasenaActualizada = await this.usuariosRepository.save(usuarioActualizarContrasena);
    return {
  idUsuario: contrasenaActualizada.idUsuario,
  nombreUsuario: contrasenaActualizada.nombreUsuario,
  apellidoUsuario: contrasenaActualizada.apellidoUsuario,
  email: contrasenaActualizada.email,
  fechaRegistro: contrasenaActualizada.fechaRegistro,
  usuarioActivo: contrasenaActualizada.usuarioActivo,
  rolSistema: contrasenaActualizada.rolSistema
};
  }

  /* ========== ELIMINAR USUARIO ========== */
  /** 
   * Método para eliminar un usuario por su ID.
   * @param {number} id - ID del usuario a eliminar.
   * @param {EliminarUsuarioDto} eliminarUsuarioDto - DTO con la contraseña actual del usuario.
   * @returns {Promise<void>} - Promesa que se resuelve cuando el usuario ha sido eliminado exitosamente.
   */

  async eliminarUsuario(id: number, dto: EliminarUsuarioDto) {
    const usuarioEliminar = await this.usuariosRepository.findOne({ where: { idUsuario: id }, select: ['idUsuario', 'contrasena'], })
    if (!usuarioEliminar) { throw new NotFoundException('Usuario no encontrado'); }
    if (!usuarioEliminar.contrasena) { throw new BadRequestException('No hay contraseña almacenada para este usuario'); }
    const contrasenaEliminar = await bcrypt.compare(dto.contrasenaActual, usuarioEliminar.contrasena);
    if (!contrasenaEliminar) { throw new BadRequestException('La contraseña es incorrecta') }

    usuarioEliminar.usuarioActivo = false;
    await this.usuariosRepository.save(usuarioEliminar);
    return { message: 'Usuario eliminado exitosamente' };
  }
}
