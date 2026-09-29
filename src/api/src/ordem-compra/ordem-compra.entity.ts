import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { Fornecedor } from '../fornecedores/fornecedor.entity';
import { ItemOrdemCompra } from './itens-ordem-compra.entity';

/**
 * Capa/itens: uma OrdemCompra (capa) pode envolver varios materiais de
 * uma vez. O material, a quantidade e o valor unitario moram em
 * ItemOrdemCompra (Itens_Ordem_Compra).
 */
@Entity('Ordens_Compra')
export class OrdemCompra {
  @ApiProperty({
    example: 1,
    description: 'Identificador único da ordem de compra',
  })
  @PrimaryGeneratedColumn('identity', {
    type: 'smallint',
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'Ordens_Compra_pk',
  })
  declare id: number;

  @ApiProperty({
    example: '2026-08-26T10:30:00Z',
    description: 'Data e hora de emissão da ordem de compra',
  })
  @Column({ type: 'timestamptz' })
  declare dt_emissao: Date;

  @ApiProperty({
    example: '2026-09-05T00:00:00Z',
    description: 'Data prevista para entrega, informada no momento da emissão',
    required: false,
  })
  @Column({ type: 'timestamptz', nullable: true })
  declare dt_entrega_prevista: Date | null;

  @ApiProperty({
    example: '2026-09-04T14:15:00Z',
    description: 'Data em que a entrega efetivamente ocorreu (preenchida no recebimento)',
    required: false,
  })
  @Column({ type: 'timestamptz', nullable: true })
  declare dt_entrega: Date | null;

  @ApiProperty({
    example: 1,
    description: 'Identificador do fornecedor responsável pela ordem de compra',
  })
  @Column({ type: 'smallint' })
  declare fornecedor_id: number;

  @ManyToOne(() => Fornecedor)
  @JoinColumn({
    name: 'fornecedor_id',
    foreignKeyConstraintName: 'fk_oc_fornecedor',
  })
  declare fornecedor: Fornecedor;

  @ApiProperty({
    example: 1250.5,
    description: 'Valor total da ordem de compra (soma dos itens)',
    required: false,
  })
  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true })
  declare valor_total: number | null;

  @ApiProperty({
    type: () => [ItemOrdemCompra],
    description: 'Materiais, quantidades e valores envolvidos nesta ordem de compra',
  })
  @OneToMany(() => ItemOrdemCompra, (item) => item.ordemCompra, { cascade: true })
  declare itens: ItemOrdemCompra[];
}