import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
//import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RespuestaLoginDto } from './dto/respuesta-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  /* =============== LOGIN DE USUARIO =============== */
  /**
   * @param {string} email - Email del usuario que intenta iniciar sesión.
   * @param {string} contrasena - Contraseña del usuario que intenta iniciar sesión.
   * @returns {Promise<RespuestaLoginDto>} - Promesa que resuelve con los datos del usuario si el login es exitoso, o lanza una excepción si falla.
   */
  async login(email: string, contrasena: string): Promise<RespuestaLoginDto> {
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

    const payload = { email: usuarioLogin.email, sub: usuarioLogin.idUsuario };
    const token = await this.jwtService.signAsync(payload);

    // Devolver el token JWT junto con el email y el ID del usuario autenticado
    return {
      token,
      email: usuarioLogin.email,
      idUsuario: usuarioLogin.idUsuario,
    };
  }
}
