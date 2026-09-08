import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { Movimentacao } from './movimentacao.entity';
// Quando a branch feature/cadastro-materiais-backend for mergeada:
// import { Material } from '../materiais/material.entity';

/**
 * Capa/itens: uma Movimentacao (capa) pode envolver varios materiais de
 * uma vez (ex.: recebimento de uma compra com 5 itens diferentes). Cada
 * linha aqui e' um material + quantidade dentro dessa movimentacao.
 */
@Entity('Itens_Movimento')
export class ItemMovimento {
  @ApiProperty({
    example: 1,
    description: 'Identificador da movimentação (capa) a que este item pertence',
  })
  @PrimaryColumn({ type: 'smallint' })
  declare movimento_id: number;

  @ApiProperty({
    example: 1,
    description: 'Identificador do material movimentado',
  })
  @PrimaryColumn({ type: 'smallint' })
  declare material_id: number;

  @ApiProperty({
    example: 10,
    description: 'Quantidade deste material movimentada',
  })
  @Column({ type: 'integer' })
  declare quantidade: number;

  @ManyToOne(() => Movimentacao, (movimentacao) => movimentacao.itens)
  @JoinColumn({
    name: 'movimento_id',
    foreignKeyConstraintName: 'fk_movimento_id',
  })
  declare movimentacao: Movimentacao;

  // Sem FK ainda: a tabela "Materiais" nao existe no codigo (PR em revisao).
  // Descomentar junto com o entity do Material quando o PR mergear.
  // @ManyToOne(() => Material)
  // @JoinColumn({
  //   name: 'material_id',
  //   foreignKeyConstraintName: 'fk_material_id',
  // })
  // declare material: Material;
}
