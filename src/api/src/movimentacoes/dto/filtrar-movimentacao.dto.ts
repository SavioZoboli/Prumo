import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsISO8601, IsOptional, IsPositive } from 'class-validator';

/**
 * RF09: consulta do historico de movimentacoes por periodo, material ou tipo de operacao.
 * Todos os campos sao opcionais e combinaveis (AND).
 */
export class FiltrarMovimentacaoDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Filtra pelas movimentações que envolvem este material (entre os itens da capa)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  material_id?: number;

  @ApiPropertyOptional({
    example: 'E',
    description: 'Filtra pelo tipo de operação: E = Entrada ou S = Saída',
  })
  @IsOptional()
  @IsIn(['E', 'S'])
  operacao?: string;

  @ApiPropertyOptional({
    example: '2026-08-01T00:00:00Z',
    description: 'Data/hora inicial do período (inclusive)',
  })
  @IsOptional()
  @IsISO8601()
  dataInicio?: string;

  @ApiPropertyOptional({
    example: '2026-08-31T23:59:59Z',
    description: 'Data/hora final do período (inclusive)',
  })
  @IsOptional()
  @IsISO8601()
  dataFim?: string;
}
