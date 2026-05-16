import {
  Controller,
  Post,
  Body,
  HttpStatus,
  UseGuards,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import {
  RespuestaInvitacionListadoDto,
  RespuestaAccionInvitacionDto,
  TablerosService,
} from './tableros.service';
import { CrearTableroDto } from './dto/crear-tablero.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Tableros } from './entities/tablero.entity';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Usuarios } from '../usuarios/entity/usuario.entity';
import { ActualizarTableroDto } from './dto/actualizar-tablero.dto';
import { InvitacionesTableros } from './entities/invitaciones-tableros.entity';
import { InvitarUsuarioDto } from './dto/invitar-usuario.dto';
import { ResponderInvitacionDto } from './dto/responder-invitacion.dto';

@ApiTags('tableros')
@Controller('tableros')
export class TablerosController {
  constructor(private readonly tablerosService: TablerosService) {}

  /* ========== CREAR TABLEROS ========== */
  @ApiOperation({
    summary: 'Crear nuevo tablero',
    description: 'Crea un nuevo tablero en el sistema',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tablero creado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El tablero no pudo ser creado',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nombreTablero: { type: 'string', example: 'Mi Tablero' },
        descripcionTablero: {
          type: 'string',
          example: 'Descripción del tablero',
        },
      },
    },
  })
  @Post()
  @UseGuards(AuthGuard)
  async crearTablero(
    @GetUser() usuario: Usuarios,
    @Body() crearTableroDto: CrearTableroDto,
  ): Promise<Tableros> {
    return await this.tablerosService.crearTablero(
      crearTableroDto,
      usuario.idUsuario,
    );
  }

  /* ========== OBTENER TABLEROS ========== */
  @ApiOperation({
    summary: 'Obtener todos los tableros',
    description: 'Obtiene una lista de todos los tableros en el sistema',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de tableros obtenida exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error al obtener los tableros',
  })
  @Get()
  async obtenerTableros(): Promise<Tableros[]> {
    return await this.tablerosService.obtenerTableros();
  }

  /* ========== OBTENER TABLERO POR USUARIO ========== */
  @ApiOperation({
    summary: 'Obtener tableros de un usuario autenticado',
    description:
      'Devuelve solo los tableros del usuario identificado por el token de autenticación',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de tableros obtenida exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los tableros',
  })
  @UseGuards(AuthGuard)
  @Get('usuario')
  async obtenerTablerosUsuario(
    @GetUser() usuario: Usuarios,
  ): Promise<Tableros[]> {
    return await this.tablerosService.obtenerTablerosUsuario(usuario.idUsuario);
  }

  /* ========== LISTAR INVITACIONES PENDIENTES ========== */
  @ApiOperation({
    summary: 'Listar invitaciones pendientes',
    description: 'Obtiene una lista de las invitaciones pendientes del usuario',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de invitaciones obtenida exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener las invitaciones',
  })
  @Get('invitaciones')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async listarInvitaciones(
    @GetUser() usuario: Usuarios,
  ): Promise<RespuestaInvitacionListadoDto[]> {
    return await this.tablerosService.listarInvitacionesPendientes(
      usuario.idUsuario,
    );
  }

  /* ========== OBTENER DETALLES DE UN TABLERO ========== */
  @ApiOperation({
    summary: 'Obtener detalles de un tablero',
    description: 'Obtiene los detalles de un tablero específico',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detalles del tablero obtenidos exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al obtener los detalles del tablero',
  })
  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async obtenerDetallesTablero(
    @GetUser() usuario: Usuarios,
    @Param('id') idTablero: number,
  ): Promise<Tableros> {
    return await this.tablerosService.obtenerDetallesTablero(
      idTablero,
      usuario.idUsuario,
    );
  }

  /* ========== EDITAR UN TABLERO ========== */
  @ApiOperation({
    summary: 'Editar un tablero propio',
    description: 'Permite la edición de un tablero propio',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Edición del tablero exitoso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al editar tablero',
  })
  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async editarTablero(
    @GetUser() usuario: Usuarios,
    @Param('id') idTablero: number,
    @Body() actualizarTableroDto: ActualizarTableroDto,
  ): Promise<Tableros> {
    return await this.tablerosService.editarTablero(
      idTablero,
      actualizarTableroDto,
      usuario.idUsuario,
    );
  }

  /* ========== INVITAR USUARIOS A UN TABLERO ========== */
  @ApiOperation({
    summary: 'Invitar usuarios a un tablero',
    description: 'Permite invitar a otros usuarios a colaborar en un tablero',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Invitación creada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al crear la invitación',
  })
  @Post(':id/invitaciones')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async invitarUsuario(
    @GetUser() usuario: Usuarios,
    @Param('id') idTablero: number,
    @Body() dto: InvitarUsuarioDto,
  ): Promise<InvitacionesTableros> {
    return await this.tablerosService.invitarUsuario(
      idTablero,
      dto,
      usuario.idUsuario,
    );
  }

  /* ========== RESPONDER INVITACIÓN ========== */
  @ApiOperation({
    summary: 'Responder a una invitación',
    description: 'Permite aceptar o rechazar una invitación a un tablero',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Respuesta a la invitación procesada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error al procesar la respuesta a la invitación',
  })
  @Patch('invitaciones/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async responderInvitacion(
    @GetUser() usuario: Usuarios,
    @Param('id') idInvitacion: number,
    @Body() dto: ResponderInvitacionDto,
  ): Promise<RespuestaAccionInvitacionDto> {
    return await this.tablerosService.responderInvitacion(
      idInvitacion,
      dto,
      usuario.idUsuario,
    );
  }
}
