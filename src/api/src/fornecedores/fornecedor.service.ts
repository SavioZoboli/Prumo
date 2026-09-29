import { Injectable } from "@nestjs/common";
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Fornecedor } from "./fornecedor.entity";
import { UpdateFornecedorDto } from "../usuarios/dto/update-fornecedor.dto";
import { CreateFornecedorDto } from "../usuarios/dto/create-fornecedor.dto";
import { normalizarCnpj } from "./cnpj.validator";

@Injectable()
export class FornecedorService {
  constructor(
    @InjectRepository(Fornecedor)
    private fornecedorRepository: Repository<Fornecedor>
  ) {}

 async create(createFornecedorDto: CreateFornecedorDto): Promise<Fornecedor> {
  try {
    const fornecedor = this.fornecedorRepository.create({
      ...createFornecedorDto,
      cnpj: normalizarCnpj(createFornecedorDto.cnpj),
    });

    return await this.fornecedorRepository.save(fornecedor);
} catch (error: any) {
        if (error.code === '23505') {
      throw new ConflictException('Fornecedor já cadastrado.');
    }
    throw error;
  }
}

  async findAll(): Promise<Fornecedor[]> {
    return this.fornecedorRepository.find({
    where: {
      ativo: true,
    },
  });
  }

  async findOne(id: number): Promise<Fornecedor | null> {
    return this.fornecedorRepository.findOne({
        where: { id},
    });

}

async update(
    id: number,
    updateFornecedorDto: UpdateFornecedorDto,
): Promise<Fornecedor | null>{
    const dados: UpdateFornecedorDto = { ...updateFornecedorDto };

    if (dados.cnpj) {
      dados.cnpj = normalizarCnpj(dados.cnpj);
    }

    await this.fornecedorRepository.update(id, dados);
    return this.findOne(id);
}

async desativar(id: number): Promise<Fornecedor | null> {
  await this.fornecedorRepository.update(id, {
    ativo: false,
  });

  return this.findOne(id);
}
}