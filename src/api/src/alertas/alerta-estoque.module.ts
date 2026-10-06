import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from '../materiais/material.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { AlertaEstoqueService } from './alerta-estoque.service';

@Module({
    imports: [TypeOrmModule.forFeature([Material, Usuario])],
    providers: [AlertaEstoqueService],
    exports: [AlertaEstoqueService],
})

export class AlertaEstoqueModule {}
