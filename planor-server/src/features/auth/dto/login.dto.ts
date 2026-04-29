import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
  /* Validación del correo electrónico*/
  @ApiProperty({
    description: 'Correo electrónico de registro',
    required: true,
    format: 'email',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }
  })
  @IsEmail()
  @Length(5, 255)
  email!: string;
  /* Validación de contraseña*/
  @ApiProperty({
    description: 'Contraseña de la cuenta asociada al email',
    required: true,
  })
  @IsString()
  //@IsNotEmpty()
  @Length(8, 255)
  contrasena!: string;
}
