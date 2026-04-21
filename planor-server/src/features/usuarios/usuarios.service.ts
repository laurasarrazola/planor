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

// @Injectable() marca la clase para la inyección de dependencias, se crea automáticamente con el CLI.
@Injectable()
// UsuariosService es el servicio que contiene la lógica para gestionar usuarios.
export class UsuariosService {
  /* El constructor (Método que inicializa la instancia) recibe el repositorio (Objeto que gestiona acceso, consultas y operaciones persistentes sobre entidades) y crea el objeto usuariosRepository (permite acceder a la BD), que trabaja con la entidad definida en user.entity.ts */
  constructor(
    @InjectRepository(Usuarios)
    private readonly usuariosRepository: Repository<Usuarios>,
  ) {}

  /* ========== CREAR USUARIO ========== */
  /**
   * Crea un nuevo usuario en el sistema usando los datos del DTO.
   * @param {CrearUsuarioDto} crearUsuarioDto - información del usuario
   * @returns {Promise<Usuarios>} - Promesa que se resuelve con el usuario creado.
   */

  // El método create recibe un DTO (crearUsuarioDto) y devuelve una promesa que se resuelve con el usuario creado (Usuarios).
  async create(crearUsuarioDto: CrearUsuarioDto): Promise<Usuarios> {
    /* Validar que el email no esté previamente registrado */
    const usuarioExistente = await this.usuariosRepository.findOneBy({
      email: crearUsuarioDto.email,
    });
    if (usuarioExistente) {
      throw new BadRequestException(
        'Ya existe un usuario con el email ingresado',
      );
    }

    // Hashea la contraseña con el método hashPassword creado anteriormente y el valor de contrasena de crearUsuarioDto.
    const hashed = await this.hashPassword(crearUsuarioDto.contrasena);

    // crea una nueva instancia de la entidad Usuarios usando el repositorio de TypeORM (this.usuariosRepository.create()) y asigna los valores del DTO (nombreUsuario, apellidoUsuario, email) y el hash de la contraseña (contrasena: hashed).
    const usuario = this.usuariosRepository.create({
      nombreUsuario: crearUsuarioDto.nombreUsuario,
      apellidoUsuario: crearUsuarioDto.apellidoUsuario,
      email: crearUsuarioDto.email,
      contrasena: hashed,
    });

    // guarda el nuevo usuario en la base de datos usando el método save() del repositorio de TypeORM (this.usuariosRepository.save(usuario)) y devuelve el resultado.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contrasena, ...SanitizedUser } =
      await this.usuariosRepository.save(usuario);
    return SanitizedUser;
  }

  /* ========== HASHEO DE CONTRASEÑAS ========== */
  /**
   * hasheo de contraseñas usando bcrypt
   * @param {string} contrasena - Contraseña sin hash.
   * @returns {Promise<string>} - Promesa que se resuelve con el hash de la contraseña.
   */
  /* Método que recibe la contraseña(contrasena: string) sin hash y devuelve (Promise<string>) su versión hasheada (hashedPassword) usando bcrypt.hash*/
  private async hashPassword(contrasena: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);
    return hashedPassword;
  }

  /* ========== OBTENER USUARIOS ========== */
  /**
   * Método para obtener todos los usuarios del sistema.
   * @param {void} - No recibe parámetros.
   * @returns {Promise<Usuarios[]>} - Promesa que resuelve con un array de usuarios.
   */

  /* Obtiene de usuariosRepository los datos de la bd descritos en find(), donde no se incluye la contraseña */
  async get(): Promise<Usuarios[]> {
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
  async getById(id: number): Promise<Usuarios> {
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

  //La función obtenerConFiltros recibe la estructura de obtenerUsuariosDto a través de la variable 'filtros' para la consulta y devuelve una promesa que resuelve con un array de usuarios que cumplen los filtros.
  async obtenerConFiltros(filtros: ObtenerUsuariosDto) {
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

  /*************************************** */
  /*************************************** */
  /* métodos update, delete */
  /*************************************** */
  /*************************************** */
}
