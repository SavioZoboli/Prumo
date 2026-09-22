import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('Fabricantes')
@Unique('uq_fabricante_nome', ['nome'])
export class Fabricante {

  @ApiProperty({
    example: 1,
    description: 'Identificador único do fabricante',
  })
  @PrimaryGeneratedColumn('identity', {
    type: 'smallint',
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'pk_fabricante',
  })
  declare id: number;

  @ApiProperty({
    example: 'Sandvik',
    description: 'Nome do fabricante',
  })
  @Column({ type: 'varchar', length: 40 })
  declare nome: string;

  @ApiProperty({
    example: true,
    description: 'Indica se o fabricante está ativo',
  })
  @Column({ name: 'is_ativo', type: 'boolean', nullable: false, default: true })
  declare ativo: boolean;
}
