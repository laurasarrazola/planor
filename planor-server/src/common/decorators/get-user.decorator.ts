import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// createParamDecorator() Crea decoradores personalizados para extraer datos específicos del contexto de ejecución.
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    //Obtiene el objeto Request del contexto de ejecución HTTP y el usuario inyectado por el AuthGuard.
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    // Si se proporciona un argumento al decorador (data), devuelve solo esa propiedad del usuario. De lo contrario, devuelve el objeto completo del usuario.
    if (data) {
      return user?.[data as keyof typeof user];
    }
    return user;
  },
);
