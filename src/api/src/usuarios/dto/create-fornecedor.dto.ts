import { ApiProperty } from '@nestjs/swagger';

export class CreateFornecedorDto {
  @ApiProperty({
    example: 'Prumo Ltda',
    description: 'Nome do fornecedor',
  })
  nome!: string;

  @ApiProperty({
    example: '12.345.678/0001-90',
    description: 'CNPJ do fornecedor',
    required: true,
  })
  cnpj?: string;

  @ApiProperty({
    example: true,
    description: 'Define se o fornecedor está ativo',
    required: false,
  })
  ativo?: boolean;
}