// Injectable: Marca el servicio como inyectable. BadRequestException: lanza error HTTP 400 cuando un dato es inválido.
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
//import { CambiarContrasenaDto } from './dto/cambiar-contrasena.dto';

// @Injectable() marca la clase para la inyección de dependencias, se crea automáticamente con el CLI.
@Injectable()

// PasswordService es un servicio que se encarga de manejar el hashing y comparación de contraseñas usando bcrypt.
export class PasswordService {
  private readonly saltRounds = 10;
  // hash() toma la contraseña en texto plano y devuelve una promesa que se resuelve con la contraseña hasheada usando bcrypt.hash()
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }
  // compare() toma la contraseña en texto plano y un hash, y devuelve una promesa que se resuelve con un booleano indicando si la contraseña coincide con el hash usando bcrypt.compare()
  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}

// UsuariosService es el servicio que contiene la lógica para gestionar usuarios.
export class UsuariosService {
  //Constructor: inyecta el repositorio Usuarios y PasswordService para operaciones DB y hashing de contraseñas
  constructor(
    @InjectRepository(Usuarios)
    private readonly usuariosRepository: Repository<Usuarios>,
    private readonly passwordService: PasswordService,
  ) {}

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

    // Hashea la contraseña usando PasswordService
    const hashed = await this.passwordService.hash(crearUsuarioDto.contrasena);

    // Crea una nueva instancia de la entidad Usuarios usando el método create() de TypeORM.
    const usuario = this.usuariosRepository.create({
      nombreUsuario: crearUsuarioDto.nombreUsuario,
      apellidoUsuario: crearUsuarioDto.apellidoUsuario,
      email: crearUsuarioDto.email,
      contrasena: hashed,
    });

    // Guarda el nuevo usuario en la base de datos con el método save() de TypeORM. Luego, se desestructura el objeto guardado para eliminar la contraseña antes de devolverlo.
    const saved = await this.usuariosRepository.save(usuario);
    const { contrasena: _contrasena, ...sanitized } = saved;
    void _contrasena;
    return sanitized as Usuarios;
  }

  /* ========== OBTENER USUARIOS ========== */
  /**
   * Método para obtener todos los usuarios del sistema.
   * @param {void} - No recibe parámetros.
   * @returns {Promise<Usuarios[]>} - Promesa que resuelve con un array de usuarios.
   */

  /* Obtiene de usuariosRepository los datos de la bd descritos en find(), donde no se incluye la contraseña */
  async obtenerUsuarios(): Promise<Usuarios[]> {
    const usuarios = await this.usuariosRepository.find({
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
    return usuarios;
  }

  /* ========== OBTENER USUARIOS POR ID ========== */
  /**
   * Método para obtener un usuario por su ID.
   * @param {number} id - ID del usuario a obtener.
   * @returns {Promise<Usuarios>} - Promesa que resuelve con el usuario encontrado.
   */
  async obtenerUsuarioPorId(id: number): Promise<Usuarios> {
    const usuario = await this.usuariosRepository.findOne({
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
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  /* ========== OBTENER USUARIOS CON FILTROS (QUERY PARAMS) ========== */
  /**
   * Método para obtener usuarios con filtros (Query Params)
   * @param {ObtenerUsuariosDto} obtenerUsuariosDto - DTO con los filtros para la consulta.
   * @returns {Promise<Usuarios[]>} - Promesa que resuelve con array de usuarios que cumplen los filtros.
   */

  //La función obtenerUsuariosConFiltros recibe la estructura de obtenerUsuariosDto a través de la variable 'filtros' para la consulta y devuelve una promesa que resuelve con un array de usuarios que cumplen los filtros.
  async obtenerUsuariosConFiltros(filtros: ObtenerUsuariosDto) {
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

    //andWhere cumple una función equivalente a una cláusula WHERE en SQL, permitiendo añadir condiciones adicionales unidas por AND en la consulta (por ejemplo: SELECT FROM usuarios WHERE condición1 AND condición2).

    // id (número)
    if (typeof filtros.idUsuario === 'number') {
      constructorConsulta.andWhere('usuario.idUsuario = :id', {
        id: filtros.idUsuario,
      });
    }

    // nombre
    if (
      typeof filtros.nombreUsuario === 'string' &&
      filtros.nombreUsuario.length > 0
    ) {
      constructorConsulta.andWhere('usuario.nombreUsuario = :nombre', {
        nombre: filtros.nombreUsuario,
      });
    }

    // apellido
    if (
      typeof filtros.apellidoUsuario === 'string' &&
      filtros.apellidoUsuario.length > 0
    ) {
      constructorConsulta.andWhere('usuario.apellidoUsuario = :apellido', {
        apellido: filtros.apellidoUsuario,
      });
    }

    // email
    if (
      typeof filtros.emailUsuario === 'string' &&
      filtros.emailUsuario.length > 0
    ) {
      constructorConsulta.andWhere('usuario.email = :email', {
        email: filtros.emailUsuario,
      });
    }

    // usuarioActivo
    if (typeof filtros.usuarioActivo === 'boolean') {
      constructorConsulta.andWhere('usuario.usuarioActivo = :activo', {
        activo: filtros.usuarioActivo,
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

  async actualizarUsuario(
    id: number,
    actualizarUsuarioDto: ActualizarUsuarioDto,
  ): Promise<Usuarios> {
    const usuario = await this.usuariosRepository.findOneBy({ idUsuario: id });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    if (typeof actualizarUsuarioDto.nombreUsuario !== 'undefined') {
      usuario.nombreUsuario = actualizarUsuarioDto.nombreUsuario!;
    }
    if (typeof actualizarUsuarioDto.apellidoUsuario !== 'undefined') {
      usuario.apellidoUsuario = actualizarUsuarioDto.apellidoUsuario!;
    }

    const saved = await this.usuariosRepository.save(usuario);
    const { contrasena: _contrasena, ...sanitized } = saved;
    void _contrasena;
    return sanitized as Usuarios;
  }

  /* ========== CAMBIAR CONTRASEÑA DE USUARIO ========== */
  /**
   * Método para cambiar la contraseña de un usuario.
   * @param {number} id - ID del usuario cuya contraseña se va a cambiar.
   * @param {CambiarContrasenaDto} cambiarContrasenaDto - DTO con la contraseña actual, nueva contraseña y confirmación de nueva contraseña.
   * @returns {Promise<void>} - Promesa que se resuelve cuando la contraseña ha sido cambiada exitosamente.
   */
  // async cambiarContrasena(
  //   id: number,
  //   dto: CambiarContrasenaDto,
  // ): Promise<Usuarios> {
  //   const usuario = await this.usuariosRepository.findOneBy({ idUsuario: id });
  //   if (!usuario) {
  //     throw new NotFoundException('Usuario no encontrado');
  //   }

  //   const match = await bcrypt.compare(
  //     dto.contrasenaActual,
  //     usuario.contrasena ?? '',
  //   );
  //   if (!match) throw new BadRequestException('Contraseña actual incorrecta');

  //   if (dto.contrasenaNueva !== dto.confirmarContrasenaNueva) {
  //     throw new BadRequestException(
  //       'La nueva contraseña y la confirmación no coinciden',
  //     );
  //   }

  //   usuario.contrasena = await this.hashPassword(dto.contrasenaNueva);
  //   const saved = await this.usuariosRepository.save(usuario);
  //   const { contrasena, ...sanitized } = saved;
  //   void contrasena;
  //   return sanitized as Usuarios;
  // }

  /*************************************** */
  /*************************************** */
  /* métodos update, delete */
  /*************************************** */
  /*************************************** */
}
