import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('Fornecedores')
@Unique('uq_cnpj', ['cnpj'])
export class Fornecedor {

  @ApiProperty({
    example: 1,
    description: 'Identificador único do fornecedor',
  })
  @PrimaryGeneratedColumn('identity', {
    type: 'smallint',
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'pk_fornecedor',
  })
  declare id: number;

  @ApiProperty({
    example: 'Fruki Bebidas Ltda',
    description: 'Nome do fornecedor',
  })
  @Column({ type: 'varchar', length: 40 })
  declare nome: string;

  @ApiProperty({
    example: '12.345.678/0001-90',
    description: 'CNPJ do fornecedor',
  })
  @Column({ type: 'varchar', length: 18 })
  declare cnpj: string;

  @ApiProperty({
    example: true,
    description: 'Indica se o fornecedor está ativo',
  })
  @Column({ name: 'is_ativo', type: 'boolean', nullable: true, default: true })
  declare ativo: boolean;
}