import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  Max,
  ValidateNested,
} from 'class-validator';

// material_id e fornecedor_id sao smallint no banco (max 32767); sem o
// @Max, um valor maior estoura como 500 do Postgres em vez de 400 na validacao.
const SMALLINT_MAX = 32767;
// quantidade em Itens_Ordem_Compra e' "integer" (max ~2.1 bilhoes), nao smallint.
const INTEGER_MAX = 2147483647;

export class ItemOrdemCompraDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador do material a ser comprado',
  })
  @IsInt()
  @IsPositive()
  @Max(SMALLINT_MAX)
  material_id!: number;

  @ApiProperty({
    example: 10,
    description: 'Quantidade deste material a ser comprada',
  })
  @IsInt()
  @IsPositive()
  @Max(INTEGER_MAX)
  quantidade!: number;

  @ApiProperty({
    example: 125.5,
    description: 'Valor unitário deste material nesta ordem de compra',
  })
  @IsPositive()
  valor!: number;
}

export class CreateOrdemCompraDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador do fornecedor responsável pela ordem de compra',
  })
  @IsInt()
  @IsPositive()
  @Max(SMALLINT_MAX)
  fornecedor_id!: number;

  @ApiProperty({
    type: () => [ItemOrdemCompraDto],
    description: 'Materiais, quantidades e valores envolvidos nesta ordem de compra (ao menos um)',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemOrdemCompraDto)
  itens!: ItemOrdemCompraDto[];

  @ApiProperty({
    example: '2026-09-05T00:00:00Z',
    description: 'Data prevista para entrega',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dt_entrega_prevista?: string;
}