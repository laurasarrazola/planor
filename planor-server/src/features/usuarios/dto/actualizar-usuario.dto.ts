import { OmitType, PartialType } from '@nestjs/swagger';
import { CrearUsuarioDto } from './crear-usuario.dto';

//PartialType reutiliza los decoradores y convierte las propiedades para uso de actualización (opcionales)
export class ActualizarUsuarioDto extends PartialType(
  OmitType(CrearUsuarioDto, [
    'email',
    'contrasena',
    'confirmarContrasena',
  ] as const),
) {}
