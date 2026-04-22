import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  HttpStatus as status,
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

@ApiTags('usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /* ========== CREAR USUARIOS ========== */
  @ApiOperation({
    summary: 'Crear nuevo usuario',
    description: 'Crea un nuevo usuario en el sistema',
  })
  @ApiResponse({
    status: status.CREATED,
    description: 'Usuario creado exitosamente',
    //example: createUserExample,
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
  async create(@Body() crearUsuarioDto: CrearUsuarioDto): Promise<Usuarios> {
    return await this.usuariosService.crearUsuario(crearUsuarioDto);
  }

  /* ========== OBTENER USUARIOS ========== */
  @ApiOperation({
    summary: 'Obtener usuarios',
    description: 'Obtener usuarios del sistema',
  })
  @ApiResponse({
    status: status.OK,
    description: 'Usuarios obtenidos exitosamente',
    //example: createUserExample,
  })
  @Get()
  async get(): Promise<Usuarios[]> {
    return await this.usuariosService.obtenerUsuarios();
  }

  /* ========== OBTENER USUARIOS CON FILTROS (QUERY PARAMS) ========== */
  @ApiOperation({
    summary: 'Obtener usuarios según un parámetro específico',
    description: 'Obtener usuarios según un parámetro específico',
  })
  @ApiResponse({
    status: status.OK,
    description: 'Usuarios con parámetro obtenidos exitosamente',
  })
  @Get('buscar')
  async listar(@Query() filtros: ObtenerUsuariosDto) {
    return this.usuariosService.obtenerUsuariosConFiltros(filtros);
  }

  /* ========== OBTENER USUARIO POR ID ========== */
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description: 'Obtener un usuario específico por su ID',
  })
  @ApiResponse({
    status: status.OK,
    description: 'Usuario obtenido exitosamente',
  })
  @Get(':id')
  async getById(@Param('id') id: number): Promise<Usuarios> {
    return await this.usuariosService.obtenerUsuarioPorId(id);
  }

  /* ========== ACTUALIZAR USUARIO ========== */
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
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() actualizarUsuarioDto: ActualizarUsuarioDto,
  ) {
    return this.usuariosService.actualizarUsuario(id, actualizarUsuarioDto);
  }

  /* ========== CAMBIAR CONTRASEÑA DE USUARIO ========== */
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
  @Patch(':id/contrasena')
  async cambiarContrasena(
    @Param('id') id: number,
    @Body() cambiarContrasenaDto: CambiarContrasenaDto,
  ) {
    return await this.usuariosService.cambiarContrasena(
      id,
      cambiarContrasenaDto,
    );
  }

  /* ========== ELIMINAR USUARIO ========== */
  @ApiOperation({
    summary: 'Eliminar usuario',
    description: 'ELiminar logicamente un usuario',
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
  @Patch(':id/eliminarUsuario')
  async eliminarUsuario(
    @Param('id') id: number,
    @Body() eliminarUsuarioDto: EliminarUsuarioDto,
  ) {
    return await this.usuariosService.eliminarUsuario(id, eliminarUsuarioDto);
  }
}
