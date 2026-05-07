import { Usuarios } from '../features/usuarios/entity/usuario.entity';

declare global {
  namespace Express {
    interface Request {
      user: Usuarios;
    }
  }
}
