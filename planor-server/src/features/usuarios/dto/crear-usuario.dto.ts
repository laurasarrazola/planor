// ApiProperty es el decorador que documenta las propiedades del DTO en Swagger. Proporciona información adicional sobre cada propiedad, como su descripción, ejemplo, formato, longitud mínima y máxima, etc.
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

/*Los DTOs (Data Transfer Objects) definen la estructura de los datos que entran o salen de la API. Se utilizan clases para tipar y validar los datos que recibe un endpoint mediante decoradores de validación */

export class CrearUsuarioDto {
  /* Validación para el nombre de usuario */
  @ApiProperty({
    description: 'Nombre del usuario',
    required: true,
    minLength: 3,
    maxLength: 100,
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
  })
  @IsString()
  //@IsNotEmpty()
  @Length(3, 100)
  @Matches(/^[\p{L} ]+$/u, {
    message: 'Solo letras y espacios son permitidos',
  })
  nombreUsuario!: string;

  /* Validación para el apellido de usuario */
  @ApiProperty({
    description: 'Apellido del usuario',
    required: true,
    minLength: 3,
    maxLength: 100,
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
  })
  @IsString()
  //@IsNotEmpty()
  @Length(3, 100)
  @Matches(/^[\p{L} ]+$/u, {
    message: 'Solo letras y espacios son permitidos',
  })
  apellidoUsuario!: string;

  /* Validación para el email de usuario */
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    required: true,
    format: 'email',
    minLength: 5,
    maxLength: 255,
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }
  })
  @IsEmail()
  //@IsNotEmpty()
  @Length(5, 255)
  email!: string;

  /* Validación para la contraseña de usuario */
  @ApiProperty({
    description:
      'Contraseña con mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial.',
    required: true,
    minLength: 8,
    maxLength: 255,
  })
  @IsString()
  //@IsNotEmpty()
  @Length(8, 255)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).*$/,
  )
  contrasena!: string;

  /* Validación para confirmar la contraseña de usuario */
  @ApiProperty({
    description:
      'Confirmar contraseña, debe coincidir con la contraseña ingresada.',
    required: true,
    minLength: 8,
    maxLength: 255,
  })
  @IsString()
  //@IsNotEmpty()
  @Length(8, 255)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).*$/,
  )
  confirmarContrasena!: string;
}
