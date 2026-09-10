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
    example: '33.000.167/0001-01',
    description: 'CNPJ do fornecedor',
  })
  @Column({ type: 'varchar', length: 18 })
  declare cnpj: string;

  @ApiProperty({
    example: true,
    description: 'Indica se o fornecedor está ativo',
  })
  @Column({ name: 'is_ativo', type: 'boolean', nullable: false, default: true })
  declare ativo: boolean;
}