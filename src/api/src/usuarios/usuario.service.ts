import { Injectable } from "@nestjs/common";
import { Usuario } from "./usuario.entity";
import { LogPerfil } from "./log-perfil.entity";
import { Repository } from 'typeorm';
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import { ConflictException } from '@nestjs/common';
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(LogPerfil)
    private logPerfilRepository: Repository<LogPerfil>,
  ) {}

 async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
  try {
    const senhaHash = await bcrypt.hash(createUsuarioDto.senha, SALT_ROUNDS);

    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      email: normalizarEmail(createUsuarioDto.email),
      senha: senhaHash,
    });

    return await this.usuarioRepository.save(usuario);
} catch (error: any) {
        if (error.code === '23505') {
      throw new ConflictException('Usuário ou e-mail já cadastrado.');
    }
    throw error;
  }
}

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
    where: {
      ativo: true,
    },
  });
  }

  async findOne(id: number): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
        where: { id},
    });

}

async findByEmail(email: string): Promise<Usuario | null> {
  return this.usuarioRepository.findOne({ where: { email: normalizarEmail(email) } });
}

async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
    operadorId?: number,
): Promise<Usuario | null>{
    const dados: UpdateUsuarioDto = { ...updateUsuarioDto };

    if (dados.email) {
      dados.email = normalizarEmail(dados.email);
    }

    if (dados.senha) {
      dados.senha = await bcrypt.hash(dados.senha, SALT_ROUNDS);
    }
    const usuarioAntes = dados.perfil
      ? await this.usuarioRepository.findOne({ where: { id } })
      : null;

    await this.usuarioRepository.update(id, dados);

    if (usuarioAntes && dados.perfil && usuarioAntes.perfil !== dados.perfil && operadorId) {
      const log = this.logPerfilRepository.create({
        operador_id: operadorId,
        alvo_id: id,
        perfil_anterior: usuarioAntes.perfil,
        perfil_atual: dados.perfil,
      });
      await this.logPerfilRepository.save(log);
    }

    return this.findOne(id);
}

async desativar(id: number): Promise<Usuario | null> {
  await this.usuarioRepository.update(id, {
    ativo: false,
  });

  return this.findOne(id);
}
}