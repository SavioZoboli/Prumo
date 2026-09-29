import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsCnpj } from '../../fornecedores/cnpj.validator';

export class UpdateFornecedorDto {
  @ApiPropertyOptional({ example: 'Letícia Maria' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  nome?: string;

  @ApiPropertyOptional({ example: '33.000.167/0001-01' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(18)
  @IsCnpj()
  cnpj?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
