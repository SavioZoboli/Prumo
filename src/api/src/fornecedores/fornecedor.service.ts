import { Injectable } from "@nestjs/common";
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Fornecedor } from "./fornecedor.entity";
import { UpdateFornecedorDto } from "../usuarios/dto/update-fornecedor.dto";
import { CreateFornecedorDto } from "../usuarios/dto/create-fornecedor.dto";

@Injectable()
export class FornecedorService {
  constructor(
    @InjectRepository(Fornecedor)
    private fornecedorRepository: Repository<Fornecedor>
  ) {}

 async create(createFornecedorDto: CreateFornecedorDto): Promise<Fornecedor> {
  try {
    return await this.fornecedorRepository.save(createFornecedorDto);
} catch (error: any) {
        if (error.code === '23505') {
      throw new ConflictException('Fornecedorjá cadastrado.');
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
    await this.fornecedorRepository.update(id, updateFornecedorDto);
    return this.findOne(id);
}

async desativar(id: number): Promise<Fornecedor | null> {
  await this.fornecedorRepository.update(id, {
    ativo: false,
  });

  return this.findOne(id);
}
}