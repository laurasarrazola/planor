import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

/* DTO para cambiar la contraseña de un usuario, con validaciones específicas para la contraseña actual y la nueva contraseña. */
export class CambiarContrasenaDto {
  @ApiProperty({
    description: 'Contraseña actual del usuario',
    required: true,
    minLength: 8,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 255)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).*$/,
  )
  contrasenaActual!: string;

  @ApiProperty({
    description:
      'Nueva contraseña con mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial.',
    required: true,
    minLength: 8,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 255)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).*$/,
  )
  contrasenaNueva!: string;

  @ApiProperty({
    description: 'Confirmar nueva contraseña',
    required: true,
    minLength: 8,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 255)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).*$/,
  )
  confirmarContrasenaNueva!: string;
}
