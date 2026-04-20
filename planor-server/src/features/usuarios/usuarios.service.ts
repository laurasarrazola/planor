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

  /*************************************** */
  /**************************************** */
  /* get con id */
  /* get filtros (queryparams) */
  /**************************************** */
  /**************************************** */

  /*************************************** */
  /*************************************** */
  /* métodos update, delete */
  /*************************************** */
  /*************************************** */
}
