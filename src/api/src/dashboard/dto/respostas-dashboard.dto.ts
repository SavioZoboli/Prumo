import { ApiProperty } from '@nestjs/swagger';
import type { StatusEstoque, StatusFalta } from '../dashboard.regras';

export class ResumoDashboardDto {
  @ApiProperty({
    example: 8,
    description: 'Materiais ativos com estoque no mínimo ou abaixo dele',
  })
  declare itensAbaixoMinimo: number;

  @ApiProperty({
    example: 12,
    description: 'Materiais ativos até 20% acima do mínimo',
  })
  declare itensEmAtencao: number;

  @ApiProperty({
    example: 6,
    description: 'Ordens de compra ainda não recebidas',
  })
  declare ordensCompraPendentes: number;

  @ApiProperty({
    example: 2,
    description: 'Ordens pendentes cuja data prevista de entrega já passou',
  })
  declare ordensCompraAtrasadas: number;
}

export class ItemCriticoDto {
  @ApiProperty({ example: 1 })
  declare id: number;

  @ApiProperty({ example: 'CNMG120408' })
  declare codigo: string;

  @ApiProperty({ example: 'Pastilha 10x10 Azul' })
  declare nome: string;

  @ApiProperty({ example: 'UN', nullable: true })
  declare unidadeMedida: string | null;

  @ApiProperty({ example: 500 })
  declare estoqueAtual: number;

  @ApiProperty({ example: 2000 })
  declare estoqueMinimo: number;

  @ApiProperty({
    enum: ['ABAIXO_MINIMO', 'EM_ATENCAO'],
    example: 'ABAIXO_MINIMO',
  })
  declare status: StatusEstoque;
}

export class ItensCriticosPaginadosDto {
  @ApiProperty({ type: [ItemCriticoDto] })
  declare itens: ItemCriticoDto[];

  @ApiProperty({
    example: 8,
    description: 'Total de itens críticos (considerando a busca)',
  })
  declare total: number;

  @ApiProperty({ example: 1 })
  declare pagina: number;

  @ApiProperty({ example: 6 })
  declare limite: number;
}

export class MaterialEmFaltaDto {
  @ApiProperty({ example: 1 })
  declare id: number;

  @ApiProperty({ example: 'CNMG120408' })
  declare codigo: string;

  @ApiProperty({ example: 'Pastilha 10x10 Azul' })
  declare nome: string;

  @ApiProperty({
    enum: ['SEM_ESTOQUE', 'ABAIXO_MINIMO'],
    example: 'SEM_ESTOQUE',
    description: 'SEM_ESTOQUE quando não há nenhuma unidade disponível',
  })
  declare status: StatusFalta;
}

export class MateriaisEmFaltaPaginadosDto {
  @ApiProperty({ type: [MaterialEmFaltaDto] })
  declare itens: MaterialEmFaltaDto[];

  @ApiProperty({ example: 3 })
  declare total: number;

  @ApiProperty({ example: 1 })
  declare pagina: number;

  @ApiProperty({ example: 6 })
  declare limite: number;
}

export class UltimaMovimentacaoDto {
  @ApiProperty({ example: 42 })
  declare movimentacaoId: number;

  @ApiProperty({ example: '2026-10-06T13:14:00.000Z' })
  declare data: Date;

  @ApiProperty({ enum: ['E', 'S'], example: 'S' })
  declare operacao: string;

  @ApiProperty({ example: 1 })
  declare materialId: number;

  @ApiProperty({ example: 'Pastilha 10x10 Azul' })
  declare material: string;

  @ApiProperty({ example: 500 })
  declare quantidade: number;

  @ApiProperty({ example: 'João Silva' })
  declare usuario: string;

  @ApiProperty({ example: 'OP-1250', nullable: true })
  declare ordemProducao: string | null;

  @ApiProperty({
    example: false,
    description: 'Movimentação estornada (o front pode exibir riscada)',
  })
  declare estornado: boolean;
}

export class MovimentacaoSemanalDto {
  @ApiProperty({
    example: '2026-09-28',
    description: 'Segunda-feira da semana',
  })
  declare inicio: string;

  @ApiProperty({ example: '2026-10-04', description: 'Domingo da semana' })
  declare fim: string;

  @ApiProperty({ example: 120, description: 'Soma das quantidades de entrada' })
  declare entradas: number;

  @ApiProperty({ example: 90, description: 'Soma das quantidades de saída' })
  declare saidas: number;
}

export class MaterialConsumidoDto {
  @ApiProperty({ example: 1 })
  declare materialId: number;

  @ApiProperty({ example: 'CNMG120408' })
  declare codigo: string;

  @ApiProperty({ example: 'Pastilha 10x10 Azul' })
  declare nome: string;

  @ApiProperty({ example: 'UN', nullable: true })
  declare unidadeMedida: string | null;

  @ApiProperty({ example: 4500, description: 'Soma das saídas no mês' })
  declare quantidade: number;
}
