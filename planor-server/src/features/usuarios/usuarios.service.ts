// importa el decorador Injectable; se usa para marcar una clase como proveedor que Nest puede crear e inyectar en otros componentes. El CLI lo añade automaticamente al crear un servicio.
import { Injectable, BadRequestException } from '@nestjs/common';

// biblioteca de JavaScript para hashear contraseñas de forma segura. se usa import * as bcrypt para importar todas las funciones de bcrypt bajo el namespace bcrypt.
import * as bcrypt from 'bcrypt';

// InjectRepository se usa para inyectar un repositorio de TypeORM en el servicio, lo que permite interactuar con la base de datos a través de la entidad Usuarios.
import { InjectRepository } from '@nestjs/typeorm';

// Repository es la clase de TypeORM que proporciona métodos para interactuar con la base de datos (CRUD, consultas, etc.) para la entidad Usuarios.
import { Repository } from 'typeorm';

// Importa la entidad Usuarios desde user.entity.ts. Representa la estructura de la tabla usuarios y define cómo se almacenan y gestionan los datos en la base de datos.
import { Usuarios } from './entity/usuario.entity';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

// @Injectable() marca la clase UsuariosService como un proveedor que Nest puede gestionar e inyectar en otros componentes. Aquí se define la lógica de negocio para gestionar usuarios, como operaciones CRUD y otras funcionalidades relacionadas con los usuarios.
@Injectable()
// La clase UsuariosService es el servicio que contiene la lógica para gestionar usuarios.
export class UsuariosService {
  // Método que se ejecuta cuando Nest crea la instancia del servicio.
  constructor(
    // inyecta el repositorio(modelo) de la entidad usuarios (user.entity.ts) para su uso y gestion de base de datos
    @InjectRepository(Usuarios)
    // El repositorio de Usuarios se inyecta como una dependencia privada y de solo lectura,
    private readonly usuariosRepository: Repository<Usuarios>,
  ) {}

  /**
   * hasheo de contraseñas usando bcrypt
   * @param {string} contrasena - La contraseña sin hash.
   * @returns {Promise<string>} - Devuelve una promesa que resuelve con el hash de la contraseña.
   */

  // Método privado que recibe una contraseña(contrasena: string) sin hash y devuelve (con Promise<string>) su versión hasheada (hashedPassword) usando bcrypt.
  private async hashPassword(contrasena: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);
    return hashedPassword;
  }

  // Método para obtener todos los usuarios
  /*************************************** */
  /* PONER JSDOCS */
  async get(): Promise<Usuarios[]> {
    return await this.usuariosRepository.find({
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
  }

  /*************************************** */
  /* get con id */
  /* get filtros (queryparams) */

  // Método para usar los DTOs para crear un nuevo usuario.
  /**
   * @param {CrearUsuarioDto} crearUsuarioDto - información del usuario
   * @returns {Promise<Usuarios>} - Devuelve una promesa que resuelve con el usuario creado.
   */

  //función que recibe crearUsuarioDTO validado con la entidad Usuarios (Promise<Usuarios>) y devuelve el usuario creado.
  async create(crearUsuarioDto: CrearUsuarioDto): Promise<Usuarios> {
    // verifica si ya existe un usuario con el mismo email en la base de datos con findOneBy() de TypeORM
    const usuarioExistente = await this.usuariosRepository.findOneBy({
      email: crearUsuarioDto.email,
    });

    if (usuarioExistente) {
      throw new BadRequestException(
        'Ya existe un usuario con el email ingresado',
      );
    }

    // genera un hash de la contraseña usando el método hashPassword creado anteriormente y el valor de contrasena de crearUsuarioDto.
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

  /*************************************** */
  /* métodos update, delete */
}
