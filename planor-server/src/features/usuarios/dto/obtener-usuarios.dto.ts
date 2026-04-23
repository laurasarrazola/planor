import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type, Transform, TransformFnParams } from 'class-transformer';

export class ObtenerUsuariosDto {
  @ApiPropertyOptional({
    description: 'Búsqueda',
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
  busqueda?: string;

  //validacion para usuarios activos
  @ApiPropertyOptional({
    description: 'Indica si el usuario está activo',
    enum: ['activo', 'inactivo'],
  })
  @IsOptional()
  @IsString()
  @IsEnum(['activo', 'inactivo'])
  usuarioActivo?: 'activo' | 'inactivo';

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
}
