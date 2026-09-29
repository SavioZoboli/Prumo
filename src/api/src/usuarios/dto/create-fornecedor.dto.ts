import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsCnpj } from '../../fornecedores/cnpj.validator';

export class CreateFornecedorDto {
  @ApiProperty({
    example: 'Prumo Ltda',
    description: 'Nome do fornecedor',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  nome!: string;

  @ApiProperty({
    example: '33.000.167/0001-01',
    description: 'CNPJ do fornecedor',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(18)
  @IsCnpj()
  cnpj!: string;

  @ApiProperty({
    example: true,
    description: 'Define se o fornecedor está ativo',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
