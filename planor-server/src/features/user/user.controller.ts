import { Controller, Get } from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor() {}

  @Get()
  getHello(): string {
    return 'hola';
  }
}
