import { Injectable } from "@nestjs/common";
import { Usuario } from "./usuario.entity";
import { Repository } from 'typeorm';
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import { ConflictException } from '@nestjs/common';
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>
  ) {}

 async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
  try {
    return await this.usuarioRepository.save(createUsuarioDto);
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

async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
): Promise<Usuario | null>{
    await this.usuarioRepository.update(id, updateUsuarioDto);
    return this.findOne(id);
}

async desativar(id: number): Promise<Usuario | null> {
  await this.usuarioRepository.update(id, {
    ativo: false,
  });

  return this.findOne(id);
}
}