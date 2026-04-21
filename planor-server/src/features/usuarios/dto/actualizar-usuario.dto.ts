import {
  ApiPropertyOptional,
  IntersectionType,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { CrearUsuarioDto } from './crear-usuario.dto';
import { Matches, IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

const Base = IntersectionType(
  OmitType(CrearUsuarioDto, [
    'email',
    'contrasena',
    'confirmarContrasena',
  ] as const),
);

export class ActualizarUsuarioDto extends PartialType(Base) {
  @ApiPropertyOptional({ description: 'Nombre (opcional)' })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
    return trimmed;
  })
  @IsString()
  @Length(3, 100)
  @Matches(/^[\p{L} ]+$/u, {
    message: 'Solo letras y espacios son permitidos',
  })
  nombreUsuario?: string;

  @ApiPropertyOptional({ description: 'Apellido (opcional)' })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
    return trimmed;
  })
  @IsString()
  @Length(3, 100)
  @Matches(/^[\p{L} ]+$/u, {
    message: 'Solo letras y espacios son permitidos',
  })
  apellidoUsuario?: string;
}
