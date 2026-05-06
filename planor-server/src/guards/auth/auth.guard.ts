import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

// Claims esperados en el JWT. Se ingresan en una interface para facilitar su uso y validación.
interface PayloadJwt {
  email: string;
  sub: number;
  iat?: number;
  exp?: number;
}
// Extiende Request para permitir acceder a `request.user` con tipo seguro.
interface RequestConUsuario extends Request {
  user?: PayloadJwt;
}

@Injectable()
// Guard que valida el JWT y enriquece la request con el payload validado.
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  // JwtService inyectado para verificar tokens.
  constructor(private readonly jwtService: JwtService) {}

  // Método principal del guard; devuelve true si la petición está autenticada.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtener el objeto Request de NestJS/Express.
    const request: Request = context.switchToHttp().getRequest<Request>();
    // Extraer token del header Authorization: 'Bearer <token>'.
    const token: string | undefined = this.extraerToken(request);
    if (!token) {
      throw new UnauthorizedException('Token requerido');
    }

    try {
      const decoded: PayloadJwt = await this.jwtService.verifyAsync<PayloadJwt>(
        token,
        { secret: process.env.JWT_SECRET },
      );
      (request as RequestConUsuario).user = decoded;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
    return true;
  }

  // Método auxiliar para extraer el token JWT del header Authorization.
  private extraerToken(request: Request): string | undefined {
    const encabezadoAuthRaw: string | undefined = request.headers.authorization;

    const encabezadoAuth: string | undefined = encabezadoAuthRaw;
    if (!encabezadoAuth) {
      return undefined;
    }

    const partes: string[] = encabezadoAuth.split(' ');
    const posibleToken: string = partes[1];

    return posibleToken;
  }
}
