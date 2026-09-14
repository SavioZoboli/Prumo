import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsBoolean,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateMaterialDto {
  @ApiPropertyOptional({ example: 'Pastilha CNMG 120408' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  nome?: string;

  @ApiPropertyOptional({ example: 'CNMG120408' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo?: string;

  @ApiPropertyOptional({ example: 'Torno CNC' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  equipamento?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  estoqueMinimo?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  fabricanteId?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional({ example: 45.9 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ultimoValor?: number;

  @ApiPropertyOptional({ example: 'UN' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  unidadeMedida?: string;

  @ApiPropertyOptional({ example: 'A12' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  localizacao?: string;
}