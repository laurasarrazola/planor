import { PartialType } from '@nestjs/mapped-types';
import { CrearTableroDto } from './crear-tablero.dto';

export class ActualizarTableroDto extends PartialType(CrearTableroDto) {}
