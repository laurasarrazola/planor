import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { Type, Transform, TransformFnParams } from 'class-transformer';

export class ObtenerUsuariosDto {
  // Validación para el id del usuario
  @ApiPropertyOptional({
    description: 'id del usuario',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  idUsuario?: number;

  // Validación para el nombre del usuario
  @ApiPropertyOptional({
    description: 'Nombre del usuario',
    minLength: 3,
    maxLength: 100,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }
  })
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  nombreUsuario?: string;

  // Validación para el apellido del usuario
  @ApiPropertyOptional({
    description: 'Apellido del usuario',
    minLength: 3,
    maxLength: 100,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }
  })
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  apellidoUsuario?: string;

  // Validación para el email del usuario
  @ApiPropertyOptional({
    description: 'Correo electrónico del usuario',
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }
  })
  @Type(() => String)
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  emailUsuario?: string;

  //validacion para usuarios activos
  @ApiPropertyOptional({
    description: 'Indica si el usuario está activo',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  usuarioActivo?: boolean;

  //validacion para rol del usuario
  @ApiPropertyOptional({
    description: 'Rol del usuario en el sistema',
    enum: ['admin', 'usuario'],
  })
  @IsOptional()
  @IsEnum(['admin', 'usuario'])
  rolSistema?: 'admin' | 'usuario';

  //validacion para fecha de registro del usuario
  @ApiPropertyOptional({
    description: 'Fecha de registro del usuario',
  })
  @IsOptional()
  @Type(() => Date)
  fechaRegistro?: Date;

  //validacion para fecha de actualización del usuario
  @ApiPropertyOptional({
    description: 'Fecha de actualización del usuario',
  })
  @IsOptional()
  @Type(() => Date)
  fechaActualizacion?: Date;
  search: any;
}
