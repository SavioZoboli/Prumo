import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialRelatorioDto } from './dto/material-relatorio.dto';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
  ) {}

  async create(createMaterialDto: CreateMaterialDto): Promise<Material> {
    try {
      return await this.materialRepository.save(createMaterialDto);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Material com esse código já cadastrado.');
      }
      throw error;
    }
  }

  async findAll(): Promise<Material[]> {
    return this.materialRepository.find({
      where: { ativo: true },
    });
  }

    async getRelatorioMinimo(): Promise<MaterialRelatorioDto[]> {
    const materiaisCriticos = await this.materialRepository
      .createQueryBuilder('material')
      .leftJoinAndSelect('material.fabricante', 'fabricante')
      .where('material.ativo = :ativo', { ativo: true })
      .andWhere('material.estoqueAtual <= material.estoqueMinimo')
      .getMany();

    return materiaisCriticos.map((material) => ({
      codigo: material.codigo,
      nome: material.nome,
      equipamento: material.equipamento,
      fabricante: material.fabricante?.nome ?? 'Fabricante não encontrado',
      unidadeMedida: material.unidadeMedida,
      estoqueAtual: material.estoqueAtual,
      estoqueMinimo: material.estoqueMinimo,
      ativo: material.ativo,
    }));
  }

  async findOne(id: number): Promise<Material | null> {
    return this.materialRepository.findOne({
      where: { id },
    });
  }

  async update(
    id: number,
    updateMaterialDto: UpdateMaterialDto,
  ): Promise<Material | null> {
    await this.materialRepository.update(id, updateMaterialDto);
    return this.findOne(id);
  }

  async desativar(id: number): Promise<Material | null> {
    await this.materialRepository.update(id, {
      ativo: false,
    });

    return this.findOne(id);
  }
}