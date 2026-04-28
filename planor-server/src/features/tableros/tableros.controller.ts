import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TablerosService } from './tableros.service';
import { CrearTableroDto } from './dto/crear-tablero.dto';
import { ActualizarTableroDto } from './dto/actualizar-tablero.dto';

@Controller('tableros')
export class TablerosController {
  constructor(private readonly tablerosService: TablerosService) {}

  @Post()
  create(@Body() crearTableroDto: CrearTableroDto) {
    return this.tablerosService.create(crearTableroDto);
  }

  @Get()
  findAll() {
    return this.tablerosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tablerosService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() actualizarTableroDto: ActualizarTableroDto,
  ) {
    return this.tablerosService.update(+id, actualizarTableroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tablerosService.remove(+id);
  }
}

// import { Body, Controller, Post, HttpStatus, Req } from '@nestjs/common';
// import {
//   ApiBody,
//   ApiConsumes,
//   ApiOperation,
//   ApiResponse,
//   ApiTags,
// } from '@nestjs/swagger';
// import { TablerosService } from './tableros.service';
// import { CrearTableroDto } from './dto/crear-tablero.dto';
// import { Request } from 'express';
// import { ApiBearerAuth } from '@nestjs/swagger';

// /*`AuthRequest` es un alias local que describe el shape mínimo
//   de `req` que este controlador espera cuando el usuario viene
//   desde un guard de autenticación. */
// type AuthRequest = Request & { usuario?: { idPropietario?: number | string } };

// @ApiTags('tableros')
// @ApiBearerAuth()
// @Controller('tableros')
// export class TablerosController {
//   constructor(private readonly tablerosService: TablerosService) {}

//   /* ========== CREAR TABLEROS ========== */
//   @ApiOperation({
//     summary: 'Crear nuevo tablero',
//     description: 'Crea un nuevo tablero en el sistema',
//   })
//   @ApiResponse({
//     status: HttpStatus.CREATED,
//     description: 'Tablero creado exitosamente',
//   })
//   @ApiResponse({
//     status: HttpStatus.BAD_REQUEST,
//     description: 'El tablero no pudo ser creado',
//   })
//   @ApiConsumes('application/x-www-form-urlencoded')
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         nombreTablero: { type: 'string', example: '' },
//         descripcionTablero: { type: 'string', example: '' },
//       },
//     },
//   })
//   @Post()
//   @ApiOperation({
//     summary: 'Crear nuevo tablero (propietario = usuario autenticado)',
//   })
//   async create(
//     @Req() req: AuthRequest,
//     @Body() crearTableroDto: CrearTableroDto,
//   ): Promise<any> {
//     return await this.tablerosService.crearTablero(crearTableroDto, 1);
//   }
// }
