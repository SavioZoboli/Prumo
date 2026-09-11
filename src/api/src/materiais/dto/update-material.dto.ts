import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMaterialDto {
  @ApiPropertyOptional({ example: 'Pastilha CNMG 120408' })
  nome?: string;

  @ApiPropertyOptional({ example: 'CNMG120408' })
  codigo?: string;

  @ApiPropertyOptional({ example: 'Torno CNC' })
  equipamento?: string;

  @ApiPropertyOptional({ example: 10 })
  estoqueMinimo?: number;

  @ApiPropertyOptional({ example: 3 })
  fabricanteId?: number;

  @ApiPropertyOptional({ example: true })
  ativo?: boolean;

  @ApiPropertyOptional({ example: 45.9 })
  ultimoValor?: number;

  @ApiPropertyOptional({ example: 'UN' })
  unidadeMedida?: string;

  @ApiPropertyOptional({ example: 'A12' })
  localizacao?: string;
}
