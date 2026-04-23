import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CrearTableroDto {
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
