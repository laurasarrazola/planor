import { Body, Controller, Post, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Usuarios } from '../usuarios/entity/usuario.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /* =============== LOGIN DE USUARIO =============== */
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Permite iniciar sesión con email y contraseña',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login exitoso',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciales inválidas',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: '' },
        contrasena: { type: 'string', example: '' },
      },
    },
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<Usuarios> {
    return this.authService.login(loginDto.email, loginDto.contrasena);
  }
}
