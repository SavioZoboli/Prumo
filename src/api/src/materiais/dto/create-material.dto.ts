import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMaterialDto {
  @ApiProperty({
    example: 'Pastilha CNMG 120408',
    description: 'Nome do material',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nome!: string;

  @ApiProperty({
    example: 'CNMG120408',
    description: 'Código de identificação do material',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigo!: string;

  @ApiProperty({
    example: 'Torno CNC',
    description: 'Equipamento em que o material é utilizado',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  equipamento!: string;

  @ApiProperty({
    example: 10,
    description: 'Quantidade mínima antes de gerar alerta de reposição',
  })
  @IsInt()
  @Min(0)
  estoqueMinimo!: number;

  @ApiProperty({
    example: 3,
    description: 'ID do fabricante',
  })
  @IsInt()
  @Min(1)
  fabricanteId!: number;

  @ApiProperty({
    example: true,
    description: 'Define se o material está ativo',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiProperty({
    example: 45.9,
    description: 'Último valor pago pelo material',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ultimoValor?: number;

  @ApiProperty({
    example: 'UN',
    description: 'Unidade de medida (ex: UN, CX, KG)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  unidadeMedida?: string;

  @ApiProperty({
    example: 'A12',
    description: 'Localização física no estoque',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  localizacao?: string;
}