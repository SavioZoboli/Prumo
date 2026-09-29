import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogPerfil } from './log-perfil.entity';

@Injectable()
export class LogPerfilService {
  constructor(
    @InjectRepository(LogPerfil)
    private logPerfilRepository: Repository<LogPerfil>,
  ) {}

  async findAll(): Promise<LogPerfil[]> {
    return this.logPerfilRepository.find({
      order: { data: 'DESC' },
    });
  }

  async findOne(id: number): Promise<LogPerfil | null> {
    return this.logPerfilRepository.findOne({ where: { id } });
  }
}
