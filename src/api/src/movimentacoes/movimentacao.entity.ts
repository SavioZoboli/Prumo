import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { Usuario } from '../usuarios/usuario.entity';
import { ItemMovimento } from './item-movimento.entity';
// Idem para Ordens de Compra (ainda so tem front-end mockado, sem backend).
// import { OrdemCompra } from '../ordens-compra/ordem-compra.entity';

/**
 * Capa da movimentacao. O material e a quantidade moram em ItemMovimento
 * (Itens_Movimento) — uma movimentacao pode envolver varios materiais de
 * uma vez (ex.: recebimento de uma compra com 5 itens diferentes).
 */
@Entity('Movimentacoes')
export class Movimentacao {
  @ApiProperty({
    example: 1,
    description: 'Identificador único da movimentação',
  })
  @PrimaryGeneratedColumn('identity', {
    type: 'smallint',
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'pk_movimentacoes',
  })
  declare id: number;

  @ApiProperty({
    example: '2026-08-26T10:30:00Z',
    description: 'Data e hora da movimentação',
  })
  @Column({ type: 'timestamptz' })
  declare data: Date;

  @ApiProperty({
    example: 'E',
    description: 'Tipo de operação realizada (E = Entrada, S = Saída)',
  })
  @Column({ type: 'varchar', length: 1 })
  declare operacao: string;

  @ApiProperty({
    example: 'Entrada de produtos no estoque',
    description: 'Motivo da movimentação',
  })
  @Column({ type: 'text' })
  declare motivo: string;

  @ApiProperty({
    example: 1,
    description: 'Identificador do usuário responsável pela movimentação',
  })
  @Column({ type: 'smallint' })
  declare usuario_id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({
    name: 'usuario_id',
    foreignKeyConstraintName: 'fk_usuario_id',
  })
  declare usuario: Usuario;

  @ApiProperty({
    type: () => [ItemMovimento],
    description: 'Materiais e quantidades envolvidos nesta movimentação',
  })
  @OneToMany(() => ItemMovimento, (item) => item.movimentacao, { cascade: true })
  declare itens: ItemMovimento[];

  @ApiProperty({
    example: 'OP-2026-001',
    description: 'Ordem de Produção relacionada, quando aplicável',
    required: false,
  })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  declare ordem_producao: string | null;

  @ApiProperty({
    example: 1,
    description: 'Identificador da Ordem de Compra, quando a movimentação for um recebimento de compra',
    required: false,
  })
  @Column({ type: 'smallint', nullable: true })
  declare ordem_compra_id: number | null;

  // Sem FK ainda: a tabela "Ordens_Compra" nao existe no codigo (so tem
  // front-end mockado). Descomentar junto com o entity de OrdemCompra e a
  // migration que adiciona a constraint fk_ordem_compra_baixa (ver diagrama).
  // @ManyToOne(() => OrdemCompra)
  // @JoinColumn({
  //   name: 'ordem_compra_id',
  //   foreignKeyConstraintName: 'fk_ordem_compra_baixa',
  // })
  // declare ordemCompra: OrdemCompra;

  @ApiProperty({
    example: false,
    description: 'Indica se a movimentação foi estornada',
  })
  @Column({ type: 'boolean', default: false })
  declare is_estornado: boolean;

  @ApiProperty({
    example: 'Estorno solicitado por erro de lançamento',
    description: 'Motivo do estorno da movimentação',
    required: false,
  })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  declare motivo_estorno: string | null;
}
