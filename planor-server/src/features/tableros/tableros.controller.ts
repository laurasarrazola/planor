import {
  Controller,
  Post,
  Body,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import { TablerosService } from './tableros.service';
import { CrearTableroDto } from './dto/crear-tablero.dto';
import {
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
  public async crearTablero(
    @GetUser() usuario: Usuarios,
    @Body() crearTableroDto: CrearTableroDto,
  ): Promise<Tableros> {
    // Ya no necesitas validar manualmente req.user, el Guard y el Decorador lo hacen por ti
    console.log('Usuario autenticado:', usuario); // Puedes usar esta información para depuración o lógica adicional
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
  @Get()
  async obtenerTableros(): Promise<Tableros[]> {
    return await this.tablerosService.obtenerTableros();
  }
}
