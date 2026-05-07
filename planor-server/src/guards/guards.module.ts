import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Guards
import { AuthGuard } from './auth/auth.guard';
import { UsuariosModule } from '../features/usuarios/usuarios.module';

/**
 * Guards Module
 * Provides all authentication and authorization guards globally
 */
@Global()
@Module({
  imports: [
    UsuariosModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') || 'your-secret-key-here',
        signOptions: {
          expiresIn: configService.get<number>('JWT_EXPIRES_IN') || 604800,
          issuer: configService.get<string>('JWT_ISSUER') || 'teso-api',
          audience: configService.get<string>('JWT_AUDIENCE') || 'teso-client',
        },
      }),
    }),
  ],
  providers: [AuthGuard],
  exports: [
    // Guards
    AuthGuard,

    // Modules
    JwtModule,
  ],
})
export class GuardsModule {}
