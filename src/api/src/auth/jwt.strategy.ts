import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsuarioService } from '../usuarios/usuario.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usuarioService: UsuarioService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate (payload: any) {
    const usuario = await this.usuarioService.findOne(payload.sub);
    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException();
    }

    if (usuario.tokens_invalidados_em) {
      const emitidoEm = payload.iat * 1000;
      if (emitidoEm <= usuario.tokens_invalidados_em.getTime()) {
        throw new UnauthorizedException('Sessão expirada, faça login novamente.');
      }
    }

    return {
        id: usuario.id,
        email: usuario.email,
        perfil: usuario.perfil,
    };
  }
}
