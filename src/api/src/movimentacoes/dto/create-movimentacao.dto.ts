import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  ValidateNested,
} from 'class-validator';

// material_id e ordem_compra_id sao smallint no banco (max 32767); sem o
// @Max, um valor maior estoura como 500 do Postgres em vez de 400 na validacao.
const SMALLINT_MAX = 32767;
// quantidade em Itens_Movimento e' "integer" (max ~2.1 bilhoes), nao smallint.
const INTEGER_MAX = 2147483647;

export class ItemMovimentoDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador do material movimentado',
  })
  @IsInt()
  @IsPositive()
  @Max(SMALLINT_MAX)
  material_id!: number;

  @ApiProperty({
    example: 10,
    description: 'Quantidade deste material a ser movimentada',
  })
  @IsInt()
  @IsPositive()
  @Max(INTEGER_MAX)
  quantidade!: number;
}

export class CreateMovimentacaoDto {
  @ApiProperty({
    example: 'E',
    description: 'Tipo de operação: E = Entrada ou S = Saída',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1)
  operacao!: string;

  @ApiProperty({
    example: 'Entrada de produtos no estoque',
    description: 'Motivo da movimentação',
  })
  @IsString()
  @IsNotEmpty()
  motivo!: string;

  @ApiProperty({
    type: () => [ItemMovimentoDto],
    description: 'Materiais e quantidades envolvidos nesta movimentação (ao menos um)',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemMovimentoDto)
  itens!: ItemMovimentoDto[];

  @ApiProperty({
    example: 'OP-2026-001',
    description: 'Ordem de Produção, quando aplicável',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ordem_producao?: string;

  @ApiProperty({
    example: 1,
    description: 'ID da Ordem de Compra, quando a movimentação for um recebimento de compra',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(SMALLINT_MAX)
  ordem_compra_id?: number;
}
