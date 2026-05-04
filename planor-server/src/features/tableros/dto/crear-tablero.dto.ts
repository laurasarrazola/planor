import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearTableroDto {
  /* Validación del propietario del tablero */
  @ApiProperty({
    description: 'ID del propietario del tablero',
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  idPropietario!: number;

  /* Validación del nombre del tablero */
  @ApiProperty({
    description: 'Nombre del tablero',
    required: true,
    minLength: 1,
    maxLength: 150,
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 150)
  nombreTablero!: string;

  /* Validación de la descripción del tablero */
  @ApiProperty({
    description: 'Descripción del tablero',
    required: false,
    maxLength: 3000,
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
  })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  descripcionTablero?: string | null;
}
