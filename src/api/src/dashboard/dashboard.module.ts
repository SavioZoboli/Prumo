import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from '../materiais/material.entity';
import { Movimentacao } from '../movimentacoes/movimentacao.entity';
import { OrdemCompra } from '../ordem-compra/ordem-compra.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Material, Movimentacao, OrdemCompra])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
