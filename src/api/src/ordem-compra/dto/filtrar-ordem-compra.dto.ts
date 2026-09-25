import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, IsPositive } from 'class-validator';

/**
 * Consulta do historico de ordens de compra por periodo, material ou fornecedor.
 * Todos os campos sao opcionais e combinaveis (AND).
 */
export class FiltrarOrdemCompraDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Filtra pelas ordens de compra que envolvem este material (entre os itens da capa)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  material_id?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filtra pelo fornecedor responsável pela ordem de compra',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  fornecedor_id?: number;

  @ApiPropertyOptional({
    example: '2026-08-01T00:00:00Z',
    description: 'Data/hora inicial do período de emissão (inclusive)',
  })
  @IsOptional()
  @IsISO8601()
  dataInicio?: string;

  @ApiPropertyOptional({
    example: '2026-08-31T23:59:59Z',
    description: 'Data/hora final do período de emissão (inclusive)',
  })
  @IsOptional()
  @IsISO8601()
  dataFim?: string;
}