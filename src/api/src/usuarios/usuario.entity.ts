import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('Usuarios')

@Unique('uq_usuario', ['usuario'])
@Unique('uq_email', ['email'])
export class Usuario {

  @ApiProperty({
    example: 1,
    description: 'Identificador único do usuário',
  })
  @PrimaryGeneratedColumn('identity', {
    type: 'smallint',
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'pk_usuario',
  })
  declare id: number;

  @ApiProperty({
    example: 'Letícia',
    description: 'Nome do usuário',
  })
  @Column({ type: 'varchar', length: 30 })
  declare nome: string;

  @ApiProperty({
    example: 'Zalasik',
    description: 'Sobrenome do usuário',
  })
  @Column({ type: 'varchar', length: 30 })
  declare sobrenome: string;

  @ApiProperty({
    example: 'leticia@email.com',
    description: 'E-mail do usuário',
  })
  @Column({ type: 'varchar', length: 60 })
  declare email: string;

  @ApiProperty({
    example: 'leticiaz',
    description: 'Nome de usuário utilizado para acesso ao sistema',
  })
  @Column({ type: 'varchar', length: 50 })
  declare usuario: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha do usuário',
  })
  @Column({ type: 'varchar', length: 100 })
  declare senha: string;

  @ApiProperty({
    example: 'USER',
    description: 'Perfil de acesso do usuário',
  })
  @Column({ type: 'varchar', length: 5, default: 'USER' })
  declare perfil: string;

  @ApiProperty({
    example: true,
    description: 'Indica se o usuário está ativo',
  })
  @Column({ type: 'boolean', nullable: true, default: true })
  declare ativo: boolean;
}