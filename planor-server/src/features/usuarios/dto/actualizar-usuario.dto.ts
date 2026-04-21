import {
  ApiPropertyOptional,
  IntersectionType,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { CrearUsuarioDto } from './crear-usuario.dto';
import { IsOptional, IsString, Length } from 'class-validator';
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
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '' || trimmed.toLowerCase() === 'string') return undefined;
      return trimmed;
    }
    return value;
  })
  @IsString()
  @Length(3, 100)
  nombreUsuario?: string;

  @ApiPropertyOptional({ description: 'Apellido (opcional)' })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '' || trimmed.toLowerCase() === 'string') return undefined;
      return trimmed;
    }
    return value;
  })
  @IsString()
  @Length(3, 100)
  apellidoUsuario?: string;
}
