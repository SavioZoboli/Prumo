import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import type { StatusCritico } from '../dashboard.regras';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class FiltrarMateriaisDto {
  @ApiPropertyOptional({
    example: 'pastilha',
    description: 'Busca por parte do nome ou do código do material',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  busca?: string;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Página (começa em 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number;

  @ApiPropertyOptional({
    example: 6,
    default: 6,
    description: 'Itens por página (máx. 50)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limite?: number;
}

export class FiltrarItensCriticosDto extends FiltrarMateriaisDto {
  @ApiPropertyOptional({
    enum: ['ABAIXO_MINIMO', 'EM_ATENCAO'],
    description:
      'Só um dos grupos (usado pelas setas dos cards). Sem o filtro, vêm os dois.',
  })
  @IsOptional()
  @IsIn(['ABAIXO_MINIMO', 'EM_ATENCAO'])
  status?: StatusCritico;
}

export class FiltrarUltimasMovimentacoesDto {
  @ApiPropertyOptional({
    example: 5,
    default: 5,
    description: 'Quantidade de linhas (máx. 20)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limite?: number;
}

export class FiltrarMovimentacoesSemanaisDto {
  @ApiPropertyOptional({
    example: '2026-10-06',
    description:
      'Data (YYYY-MM-DD) cuja semana é a última do gráfico. Padrão: hoje. ' +
      'As setas do gráfico avançam/recuam esta data.',
  })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'dataReferencia deve estar no formato YYYY-MM-DD',
  })
  dataReferencia?: string;

  @ApiPropertyOptional({
    example: 6,
    default: 6,
    description: 'Quantidade de semanas (máx. 26)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(26)
  semanas?: number;
}

export class FiltrarMaisConsumidosDto {
  @ApiPropertyOptional({
    example: '2026-10',
    description: 'Mês de referência (YYYY-MM). Padrão: mês atual.',
  })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'mes deve estar no formato YYYY-MM',
  })
  mes?: string;

  @ApiPropertyOptional({
    example: 5,
    default: 5,
    description: 'Quantidade de materiais (máx. 20)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limite?: number;
}
