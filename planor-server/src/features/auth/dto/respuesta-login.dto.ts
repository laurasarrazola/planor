import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsJWT, IsNotEmpty, IsNumber, Length } from 'class-validator';

export class RespuestaLoginDto {
  @ApiProperty({
    description: 'Token JWT para autenticación',
    type: String,
    required: true,
    readOnly: true,
    format: 'jwt',
  })
  @IsJWT()
  token!: string;

  @ApiProperty({
    description: 'Correo electrónico de registro',
    required: true,
    format: 'email',
  })
  @IsEmail()
  @Length(5, 255)
  email!: string;

  @ApiProperty({
    description: 'ID del usuario autenticado',
    type: Number,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  idUsuario!: number;
}
