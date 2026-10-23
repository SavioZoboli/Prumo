import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdemCompra } from './ordem-compra.entity';
import { ItemOrdemCompra } from './itens-ordem-compra.entity';
import { OrdemCompraController } from './ordem-compra.controller';
import { OrdemCompraService } from './ordem-compra-servce';
import { Material } from '../materiais/material.entity';
import { Movimentacao } from '../movimentacoes/movimentacao.entity';
import { ItemMovimento } from '../movimentacoes/item-movimento.entity';

@Module({
    imports: [TypeOrmModule.forFeature([
      OrdemCompra,
      ItemOrdemCompra,
      Material,
      Movimentacao,
      ItemMovimento,
    ])],
    controllers: [OrdemCompraController],
    providers: [OrdemCompraService],
})

export class OrdemCompraModule {}