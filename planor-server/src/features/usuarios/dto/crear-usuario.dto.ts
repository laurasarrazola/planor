import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsAlpha,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

// DTO que Define las propiedades para crear un usuario. Incluye solo los campos que el cliente debe enviar (email, password, etc.), y utiliza decoradores de validación para asegurar que los datos sean correctos antes de ser procesados por el servicio.
export class CrearUsuarioDto {
  /* Validación para el nombre de usuario */
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  @IsAlpha()
  nombreUsuario!: string;

  /* Validación para el apellido de usuario */
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  @IsAlpha()
  apellidoUsuario!: string;

  /* Validación para el email de usuario */
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }
  })
  @IsEmail()
  @IsNotEmpty()
  @Length(5, 255)
  email!: string;

  /* Validación para la contraseña de usuario */
  @IsString()
  @IsNotEmpty()
  @Length(8, 255)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).*$/,
  )
  contrasena!: string;
}
