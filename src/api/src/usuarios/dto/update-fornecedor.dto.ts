import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFornecedorDto {
  @ApiPropertyOptional({ example: 'Letícia Maria' })
  nome?: string;

  @ApiPropertyOptional({ example: '12.345.678/0001-90' })
  cnpj?: string;

  @ApiPropertyOptional({ example: true })
  ativo?: boolean;
}