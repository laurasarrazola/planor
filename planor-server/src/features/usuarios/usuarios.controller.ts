import {
  Body,
  Controller,
  Get,
  Post,
  HttpStatus as status,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { Usuarios } from './entity/usuario.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

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
    return await this.usuariosService.get();
  }

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
  @Post()
  async create(@Body() crearUsuarioDto: CrearUsuarioDto): Promise<Usuarios> {
    return await this.usuariosService.create(crearUsuarioDto);
  }
}
