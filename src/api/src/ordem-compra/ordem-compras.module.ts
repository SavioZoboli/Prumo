import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdemCompra } from './ordem-compra.entity';
import { ItemOrdemCompra } from './itens-ordem-compra.entity';
import { OrdemCompraController } from './ordem-compra.controller';
import { OrdemCompraService } from './ordem-compra-servce';
// import { Material } from '../materiais/material.entity';

@Module({
    // Quando "Materiais" for mergeado, adicionar Material aqui:
    // TypeOrmModule.forFeature([OrdemCompra, ItemOrdemCompra, Material])
    imports: [TypeOrmModule.forFeature([OrdemCompra, ItemOrdemCompra])],
    controllers: [OrdemCompraController],
    providers: [OrdemCompraService],
})

export class OrdemCompraModule {}