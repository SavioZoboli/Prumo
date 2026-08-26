import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from '../usuarios/usuario.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {}

  async login (loginDto){
    const usuario = await this.usuarioService.findByUsuario(loginDto.usuario);
    if (!usuario) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }

    const senhaValida = await bcrypt.compare(loginDto.senha, usuario.senha);
    if (!senhaValida) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }

    const payload = {sub: usuario.id, username: usuario.usuario};

    return { access_token: this.jwtService.sign(payload) 

    };
  }
}
