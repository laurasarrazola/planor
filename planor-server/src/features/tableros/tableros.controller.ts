import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { TablerosService } from './tableros.service';
import { CrearTableroDto } from './dto/crear-tablero.dto';
//import { ActualizarTableroDto } from './dto/actualizar-tablero.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Tableros } from './entities/tablero.entity';

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
        idPropietario: { type: 'number', example: '' },
        nombreTablero: { type: 'string', example: '' },
        descripcionTablero: { type: 'string', example: '' },
      },
    },
  })
  @Post()
  async crearTablero(
    @Body() crearTableroDto: CrearTableroDto,
  ): Promise<Tableros> {
    const idPropietario = crearTableroDto.idPropietario;
    return await this.tablerosService.crearTablero(
      crearTableroDto,
      idPropietario,
    );
  }
}
