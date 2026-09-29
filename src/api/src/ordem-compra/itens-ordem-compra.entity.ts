import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { OrdemCompra } from './ordem-compra.entity';
// Quando a branch feature/cadastro-materiais-backend for mergeada:
// import { Material } from '../materiais/material.entity';

/**
 * Capa/itens: uma OrdemCompra (capa) pode envolver varios materiais de
 * uma vez. Cada linha aqui e' um material + quantidade + valor unitario
 * dentro dessa ordem de compra.
 */
@Entity('Itens_Ordem_Compra')
export class ItemOrdemCompra {
  @ApiProperty({
    example: 1,
    description: 'Identificador da ordem de compra (capa) a que este item pertence',
  })
  @PrimaryColumn({ type: 'smallint' })
  declare ordem_compra_id: number;

  @ApiProperty({
    example: 1,
    description: 'Identificador do material comprado',
  })
  @PrimaryColumn({ type: 'smallint' })
  declare material_id: number;

  @ApiProperty({
    example: 10,
    description: 'Quantidade deste material a ser recebida',
  })
  @Column({ type: 'integer' })
  declare quantidade: number;

  @ApiProperty({
    example: 125.5,
    description: 'Valor unitário deste material nesta ordem de compra',
  })
  @Column({ type: 'numeric', precision: 15, scale: 2 })
  declare valor: number;

  @ManyToOne(() => OrdemCompra, (ordemCompra) => ordemCompra.itens)
  @JoinColumn({
    name: 'ordem_compra_id',
    foreignKeyConstraintName: 'fk_ordem_compra_item',
  })
  declare ordemCompra: OrdemCompra;

  // Sem FK ainda: a tabela "Materiais" nao existe no codigo (PR em revisao).
  // Descomentar junto com o entity do Material quando o PR mergear.
  // @ManyToOne(() => Material)
  // @JoinColumn({
  //   name: 'material_id',
  //   foreignKeyConstraintName: 'fk_material_oc',
  // })
  // declare material: Material;
}