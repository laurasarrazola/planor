/* Este archivo se encarga de Se encarga de:
Leer el token JWT
Validarlo
Buscar el usuario en BD
Inyectar el usuario en request.user
Permitir o bloquear acceso*/
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsuariosService } from '../../features/usuarios/usuarios.service';

interface JwtPayload {
  sub: number;
  email: string;
}
@Injectable()
//CanActivate determina si una ruta o recurso puede ser accedido por un usuario, verificando la autorización del mismo.
export class AuthGuard implements CanActivate {
  constructor(
    // Inyectamos JwtService (nestjs/jwt) para verificar el token, ConfigService (nestjs/config) para obtener la clave secreta y UsuariosService para buscar al usuario en la base de datos.
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usuariosService: UsuariosService,
  ) {}

  // El método canActivate se ejecuta cada vez que se accede a una ruta protegida por este guard. ExecutionContext proporciona acceso al contexto de ejecución actual (HTTP, WebSocket, GraphQL, etc.)
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // switchToHttp() obtiene un objeto tipo HttpArgumentsHost, este tiene métodos HTTP como getRequest() para obtener headers, body, query o pararms.
    const request = context.switchToHttp().getRequest<Request>();
    // Extraemos el token JWT del encabezado Authorization (formato: "Bearer <token>")
    const token = this.extraerTokenDelEncabezado(request);

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      // Verifica el JWT usando el token y la clave secreta. Si es válido, devuelve el payload con los datos del usuario autenticado.
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Buscamos el usuario completo en la base de datos
      const usuario = await this.usuariosService.obtenerUsuarioPorId(
        payload.sub,
      );

      // Inyecta el usuario en el request. .user es una propiedad agregada manualmente a Request en index.d.ts, que le dice a TypeScript que request.user existe y tendrá estructura tipo Usuarios.
      request.user = usuario;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
    return true;
  }

  // Método privado para extraer el token JWT del encabezado de la solicitud HTTP.
  private extraerTokenDelEncabezado(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer') {
      return token;
    } else {
      return undefined;
    }
  }
}
