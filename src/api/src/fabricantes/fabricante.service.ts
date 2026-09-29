import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fabricante } from './fabricante.entity';
import { CreateFabricanteDto } from './dto/create-fabricante.dto';
import { UpdateFabricanteDto } from './dto/update-fabricante.dto';

@Injectable()
export class FabricanteService {
  constructor(
    @InjectRepository(Fabricante)
    private fabricanteRepository: Repository<Fabricante>,
  ) {}

  async create(createFabricanteDto: CreateFabricanteDto): Promise<Fabricante> {
    try {
      return await this.fabricanteRepository.save(createFabricanteDto);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Fabricante com esse nome já cadastrado.');
      }
      throw error;
    }
  }

  async findAll(): Promise<Fabricante[]> {
    return this.fabricanteRepository.find({
      where: { ativo: true },
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Fabricante> {
    const fabricante = await this.fabricanteRepository.findOne({
      where: { id },
    });

    if (!fabricante) {
      throw new NotFoundException('Fabricante não encontrado.');
    }

    return fabricante;
  }

  async update(
    id: number,
    updateFabricanteDto: UpdateFabricanteDto,
  ): Promise<Fabricante> {
    await this.findOne(id);

    try {
      await this.fabricanteRepository.update(id, updateFabricanteDto);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Fabricante com esse nome já cadastrado.');
      }
      throw error;
    }

    return this.findOne(id);
  }

  async desativar(id: number): Promise<Fabricante> {
    await this.findOne(id);

    await this.fabricanteRepository.update(id, { ativo: false });

    return this.findOne(id);
  }
}
