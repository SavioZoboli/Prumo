import { ApiProperty } from '@nestjs/swagger';

export class CreateMaterialDto {
  @ApiProperty({
    example: 'Pastilha CNMG 120408',
    description: 'Nome do material',
  })
  nome!: string;

  @ApiProperty({
    example: 'CNMG120408',
    description: 'Código de identificação do material',
  })
  codigo!: string;

  @ApiProperty({
    example: 'Torno CNC',
    description: 'Equipamento em que o material é utilizado',
  })
  equipamento!: string;

  @ApiProperty({
    example: 10,
    description: 'Quantidade mínima antes de gerar alerta de reposição',
  })
  estoqueMinimo!: number;

  @ApiProperty({
    example: 3,
    description: 'ID do fabricante',
  })
  fabricanteId!: number;

  @ApiProperty({
    example: true,
    description: 'Define se o material está ativo',
    required: false,
  })
  ativo?: boolean;

  @ApiProperty({
    example: 45.9,
    description: 'Último valor pago pelo material',
    required: false,
  })
  ultimoValor?: number;

  @ApiProperty({
    example: 'UN',
    description: 'Unidade de medida (ex: UN, CX, KG)',
    required: false,
  })
  unidadeMedida?: string;

  @ApiProperty({
    example: 'A12',
    description: 'Localização física no estoque',
    required: false,
  })
  localizacao?: string;
}
