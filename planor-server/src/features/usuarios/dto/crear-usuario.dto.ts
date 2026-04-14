import { IsEmail, IsNotEmpty } from 'class-validator';

// DTO (Data Transfer Object) para la creación de un nuevo usuario. Define las propiedades necesarias para crear un usuario, como el email y la contraseña, y utiliza decoradores de validación para asegurar que los datos sean correctos antes de ser procesados por el servicio.
export class CrearUsuarioDto {
  @IsEmail()
  email!: string;
  @IsNotEmpty()
  password!: string;
}
