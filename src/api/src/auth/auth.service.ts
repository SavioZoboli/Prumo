import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from '../usuarios/usuario.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {}

  async login (loginDto: LoginDto){
    const usuario = await this.usuarioService.findByEmail(loginDto.email);
    if (!usuario) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }

    const senhaValida = await bcrypt.compare(loginDto.senha, usuario.senha);
    if (!senhaValida) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }

    if (!usuario.ativo) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
    };

    return { access_token: this.jwtService.sign(payload) 

    };
  }
}
