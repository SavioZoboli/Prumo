import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movimentacao } from './movimentacao.entity';
import { ItemMovimento } from './item-movimento.entity';
import { MovimentacaoService } from './movimentacao.service';
import { MovimentacaoController } from './movimentacoes.controller';
import { Material } from '../materiais/material.entity';
import { AlertaEstoqueModule } from '../alertas/alerta-estoque.module';

@Module({
    imports: [TypeOrmModule.forFeature([Movimentacao, ItemMovimento, Material]), AlertaEstoqueModule],
    controllers: [MovimentacaoController],
    providers: [MovimentacaoService],
})

export class MovimentacaoModule {}