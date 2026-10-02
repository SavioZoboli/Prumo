import { ApiProperty } from '@nestjs/swagger';

export class MaterialRelatorioDto {
  @ApiProperty({ example: 'CNMG120408' })
  codigo!: string;

  @ApiProperty({ example: 'Pastilha CNMG 120408' })
  nome!: string;

  @ApiProperty({ example: 'Torno CNC' })
  equipamento!: string;

  @ApiProperty({ example: 'Sandvik' })
  fabricante!: string;

  @ApiProperty({ example: 'UN', required: false })
  unidadeMedida!: string | null;

  @ApiProperty({ example: 5 })
  estoqueAtual!: number;

  @ApiProperty({ example: 10 })
  estoqueMinimo!: number;

  @ApiProperty({ example: true })
  ativo!: boolean;
}