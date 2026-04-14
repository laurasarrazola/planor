import { Controller, Get } from '@nestjs/common';

@Controller('usuarios')
export class UsuariosController {
  @Get()
  getHello(): string {
    return 'hola desde postman';
  }
}
