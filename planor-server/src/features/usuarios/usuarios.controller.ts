import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  HttpStatus as status,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { Usuarios } from './entity/usuario.entity';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import { ObtenerUsuariosDto } from './dto/obtener-usuarios.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { CambiarContrasenaDto } from './dto/cambiar-contrasena.dto';
import { EliminarUsuarioDto } from './dto/eliminar-usuario.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { RoleGuard } from '../../guards/role/role.guard';

//@ApiTags agrupa los endpoints relacionados bajo la etiqueta 'usuarios' en la documentación Swagger.
@ApiTags('usuarios')
//@Controller define la ruta base para todos los endpoints de este controlador. Todos los endpoints definidos en esta clase estarán bajo esta ruta base.
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /* ========== CREAR USUARIOS (POST) ========== */
  @ApiOperation({
    summary: 'Crear nuevo usuario',
    description: 'Crea un nuevo usuario en el sistema',
  })
  @ApiResponse({
    status: status.CREATED,
    description: 'Usuario creado exitosamente',
  })
  @ApiResponse({
    status: status.BAD_REQUEST,
    description: 'El usuario no pudo ser creado',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nombreUsuario: { type: 'string', example: '' },
        apellidoUsuario: { type: 'string', example: '' },
        email: { type: 'string', format: 'email', example: '' },
        contrasena: { type: 'string', example: '' },
        confirmarContrasena: { type: 'string', example: '' },
      },
    },
  })
  @Post()
  async crearUsuario(
    @Body() crearUsuarioDto: CrearUsuarioDto,
  ): Promise<Usuarios> {
    return this.usuariosService.crearUsuario(crearUsuarioDto);
  }

  /* ========== OBTENER USUARIOS (GET) ========== */
  @ApiOperation({
    summary: 'Obtener usuarios',
    description: 'Obtener usuarios del sistema',
  })
  @ApiResponse({
    status: status.OK,
    description: 'Usuarios obtenidos exitosamente',
  })
  @ApiResponse({
    status: status.BAD_REQUEST,
    description: 'Los usuarios no pudieron ser obtenidos',
  })
  @Get()
  async obtenerUsuarios(): Promise<Usuarios[]> {
    return await this.usuariosService.obtenerUsuarios();
  }

  /* ========== OBTENER PERFIL PROPIO ========== */
  @ApiOperation({
    summary: 'Obtener el perfil propio como usuario autenticado',
    description: 'Obtener el perfil del usuario autenticado',
  })
  @ApiResponse({
    status: status.OK,
    description: 'Perfil del usuario obtenido exitosamente',
  })
  @ApiResponse({
    status: status.BAD_REQUEST,
    description: 'El perfil del usuario no pudo ser obtenido',
  })
  @UseGuards(AuthGuard)
  @Get('perfil')
  async obtenerPerfil(@GetUser('idUsuario') idUsuario: number) {
    return await this.usuariosService.obtenerUsuarioPorId(idUsuario);
  }

  /* ========== OBTENER USUARIOS CON FILTROS (QUERY PARAMS) (GET) ========== */
  @ApiOperation({
    summary: 'Obtener usuarios según un parámetro específico',
    description: 'Obtener usuarios según un parámetro específico',
  })
  @ApiResponse({
    status: status.OK,
    description: 'Usuarios con parámetro obtenidos exitosamente',
  })
  @ApiResponse({
    status: status.BAD_REQUEST,
    description: 'Los usuarios con parámetro no pudieron ser obtenidos',
  })
  @Get('buscar')
  async listarUsuariosConFiltros(@Query() filtros: ObtenerUsuariosDto) {
    return this.usuariosService.obtenerUsuariosConFiltros(filtros);
  }

  /* ========== OBTENER USUARIO POR ID (GET) ========== */
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description: 'Obtener un usuario específico por su ID',
  })
  @ApiResponse({
    status: status.OK,
    description: 'Usuario obtenido exitosamente',
  })
  @ApiResponse({
    status: status.BAD_REQUEST,
    description: 'El usuario no pudo ser obtenido',
  })
  @Get(':id')
  async obtenerUsuarioPorId(@Param('id') id: number): Promise<Usuarios> {
    return await this.usuariosService.obtenerUsuarioPorId(id);
  }

  /* ========== ACTUALIZAR USUARIO (PATCH) ========== */
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Actualizar un usuario específico por su ID',
  })
  @ApiResponse({
    status: status.OK,
    description: 'Usuario actualizado exitosamente',
  })
  @ApiResponse({
    status: status.BAD_REQUEST,
    description: 'El usuario no pudo ser actualizado',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nombreUsuario: { type: 'string', default: '', example: '' },
        apellidoUsuario: { type: 'string', default: '', example: '' },
      },
    },
  })
  @UseGuards(AuthGuard)
  @Patch('me')
  async actualizarUsuario(
    @Body() actualizarUsuarioDto: ActualizarUsuarioDto,
    @GetUser('idUsuario') idUsuarioSolicitante: number,
    @GetUser('rolSistema') rolUsuarioSolicitante: 'admin' | 'usuario',
  ): Promise<Usuarios> {
    // el target es el propio usuario extraído del token
    const idUsuarioObjetivo: number = idUsuarioSolicitante;
    return this.usuariosService.actualizarUsuario(
      // id,
      idUsuarioObjetivo,
      actualizarUsuarioDto,
      idUsuarioSolicitante,
      rolUsuarioSolicitante,
    );
  }

  /* ========== CAMBIAR CONTRASEÑA DE USUARIO (PATCH) ========== */
  @ApiOperation({
    summary: 'Cambiar contraseña de usuario',
    description: 'Cambiar la contraseña de un usuario específico por su ID',
  })
  @ApiResponse({
    status: status.OK,
    description: 'Contraseña actualizada exitosamente',
  })
  @ApiResponse({
    status: status.BAD_REQUEST,
    description: 'La contraseña no pudo ser actualizada',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        contrasenaActual: { type: 'string', default: '', example: '' },
        contrasenaNueva: { type: 'string', default: '', example: '' },
        confirmarContrasenaNueva: { type: 'string', default: '', example: '' },
      },
    },
  })
  @UseGuards(AuthGuard)
  @Patch('contrasena')
  async cambiarContrasena(
    @GetUser('idUsuario') idUsuarioSolicitante: number,
    @Body() cambiarContrasenaDto: CambiarContrasenaDto,
  ) {
    console.log(idUsuarioSolicitante, cambiarContrasenaDto);
    if (!cambiarContrasenaDto || !cambiarContrasenaDto.contrasenaActual) {
      throw new BadRequestException('contrasenaActual es requerida');
    }
    return await this.usuariosService.cambiarContrasena(
      idUsuarioSolicitante,
      cambiarContrasenaDto,
    );
  }

  /* ========== ACTUALIZAR USUARIO POR ADMIN ========== */
  @UseGuards(RoleGuard)
  @Patch(':id')
  async actualizarUsuarioPorId(
    @Param('id') id: number,
    @Body() actualizarUsuarioDto: ActualizarUsuarioDto,
    @GetUser('idUsuario') idUsuarioSolicitante: number,
    @GetUser('rolSistema') rolUsuarioSolicitante: 'admin' | 'usuario',
  ): Promise<Usuarios> {
    return this.usuariosService.actualizarUsuario(
      id,
      actualizarUsuarioDto,
      idUsuarioSolicitante,
      rolUsuarioSolicitante,
    );
  }

  /* ========== ELIMINAR USUARIO (DELETE) ========== */
  @ApiOperation({
    summary: 'Eliminar usuario (soft delete)',
    description:
      'Eliminar lógicamente el perfil del usuario autenticado. Requiere contraseña actual.',
  })
  @ApiResponse({
    status: status.OK,
    description: 'Usuario eliminado exitosamente',
  })
  @ApiResponse({
    status: status.BAD_REQUEST,
    description: 'EL usuario no pudo ser eliminado',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        contrasenaActual: { type: 'string', default: '', example: '' },
      },
    },
  })
  @UseGuards(AuthGuard)
  @Delete('me')
  async eliminarUsuario(
    @GetUser('idUsuario') idUsuarioSolicitante: number,
    @Body() eliminarUsuarioDto: EliminarUsuarioDto,
  ) {
    return await this.usuariosService.eliminarUsuario(
      idUsuarioSolicitante,
      eliminarUsuarioDto,
    );
  }
}

/*
Endpoints propuestos y requisito de token:
OK POST /auth/register: Crea usuario público, hashea contraseña y devuelve datos sin la contraseña.
OK POST /auth/login: Valida email+contrasena, devuelve token, email, idUsuario.
NO POST /auth/refresh: No implementado. (Flujo de refresh token faltante.)
NO POST /auth/logout: No implementado. (Revocación/invalidez de refresh token faltante.)
NO POST /auth/recover: No implementado. (Recuperación por email no implementada.)
NO POST /auth/reset: No implementado. (Reset con token de correo no implementado.)
NO POST /auth/social: No implementado. (OAuth/social login no implementado.)
NO GET /usuarios/me: No existe exactamente; actualmente hay GET /usuarios/:id — src/features/usuarios/usuarios.controller.ts. GET /usuarios/:id devuelve usuario por id (sin contraseña). Recomendado: añadir GET /usuarios/me protegido que retorne el usuario del token.
OK GET /usuarios/:id: Implementado — devuelve datos públicos del usuario por id.
OK PATCH /usuarios/me: Implementado — @Patch('me') protegido por AuthGuard; actualiza el perfil del usuario autenticado (usa @GetUser('idUsuario')).
OK PATCH /usuarios/contrasena: Implementado — @Patch('contrasena') protegido por AuthGuard; verifica contrasenaActual contra DB y guarda nueva contraseña.
OK PATCH /usuarios/:id: Implementado — @Patch(':id') protegido por RoleGuard (intended admin). Recomendación: añadir AuthGuard junto a RoleGuard (@UseGuards(AuthGuard, RoleGuard)) para garantizar que request.user exista antes de evaluar rol.
OK DELETE /usuarios/me: Implementado — @Delete('me') protegido por AuthGuard; realiza soft-delete (usuarioActivo = false) tras verificar contrasenaActual.
 */
