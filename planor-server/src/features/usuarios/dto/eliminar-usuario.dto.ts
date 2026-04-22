import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class EliminarUsuarioDto {
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
}
