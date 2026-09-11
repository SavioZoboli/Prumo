import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('Materiais')
export class Material {

  @ApiProperty({
    example: 1,
    description: 'Identificador único do material',
  })
  @PrimaryGeneratedColumn('identity', {
    type: 'smallint',
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'pk_material',
  })
  declare id: number;

  @ApiProperty({
    example: 'Pastilha CNMG 120408',
    description: 'Nome do material',
  })
  @Column({ type: 'varchar', length: 30 })
  declare nome: string;

  @ApiProperty({
    example: 'CNMG120408',
    description: 'Código de identificação do material',
  })
  @Column({ type: 'varchar', length: 20 })
  declare codigo: string;

  @ApiProperty({
    example: 'Torno CNC',
    description: 'Equipamento em que o material é utilizado',
  })
  @Column({ type: 'varchar', length: 20 })
  declare equipamento: string;

  @ApiProperty({
    example: 10,
    description: 'Quantidade mínima antes de gerar alerta de reposição',
  })
  @Column({ name: 'estoque_minimo', type: 'smallint' })
  declare estoqueMinimo: number;

  @ApiProperty({
    example: 0,
    description: 'Quantidade atual em estoque',
  })
  @Column({ name: 'estoque_atual', type: 'integer', default: 0 })
  declare estoqueAtual: number;

  @ApiProperty({
    example: true,
    description: 'Indica se o material está ativo',
  })
  @Column({ type: 'boolean', default: true })
  declare ativo: boolean;

  @ApiProperty({
    example: 45.9,
    description: 'Último valor pago pelo material',
    required: false,
  })
  @Column({ name: 'ultimo_valor', type: 'numeric', precision: 15, scale: 2, nullable: true })
  declare ultimoValor: number | null;

  @ApiProperty({
    example: 'UN',
    description: 'Unidade de medida (ex: UN, CX, KG)',
    required: false,
  })
  @Column({ name: 'unidade_medida', type: 'varchar', length: 3, nullable: true })
  declare unidadeMedida: string | null;

  @ApiProperty({
    example: 'A12',
    description: 'Localização física no estoque',
    required: false,
  })
  @Column({ type: 'varchar', length: 5, nullable: true })
  declare localizacao: string | null;

  @ApiProperty({
    example: 3,
    description: 'ID do fabricante (referência simples, sem relação formal por enquanto)',
  })
  @Column({ name: 'fabricante_id', type: 'smallint' })
  declare fabricanteId: number;
}