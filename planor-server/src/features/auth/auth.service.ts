import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
//import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Usuarios } from '../usuarios/entity/usuario.entity';

@Injectable()
export class AuthService {
  constructor(private readonly usuariosService: UsuariosService) {}

  /* =============== LOGIN DE USUARIO =============== */
  /**
   * @param {string} email - Email del usuario que intenta iniciar sesión.
   * @param {string} contrasena - Contraseña del usuario que intenta iniciar sesión.
   * @returns {Promise<Usuarios>} - Promesa que resuelve con los datos del usuario si el login es exitoso, o lanza una excepción si falla.
   */

  async login(email: string, contrasena: string): Promise<Usuarios> {
    //const { email, contrasena } = loginDto;
    // Buscar el usuario por su email desde la base de datos utilizando el servicio de usuarios
    const usuarioLogin =
      await this.usuariosService.obtenerUsuarioPorEmail(email);
    if (!usuarioLogin) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    // Verificar que el usuario tenga una contraseña registrada
    if (!usuarioLogin.contrasena)
      throw new UnauthorizedException('Credenciales inválidas');

    // Comparar la contraseña proporcionada con la contraseña almacenada en la base de datos utilizando bcrypt
    const contrasenaCorrecta = await bcrypt.compare(
      contrasena,
      usuarioLogin.contrasena,
    );
    if (!contrasenaCorrecta) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }
    // Si el login es exitoso, devolver los datos del usuario desde
    return this.usuariosService.obtenerUsuarioPorId(usuarioLogin.idUsuario);
  }
}
