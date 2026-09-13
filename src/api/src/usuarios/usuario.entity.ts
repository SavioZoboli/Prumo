import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { PerfilUsuario } from './perfil.enum';

@Entity('Usuarios')

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

  @ApiHideProperty()
  @Exclude()
  @Column({ type: 'varchar', length: 100 })
  declare senha: string;

  @ApiProperty({
    enum: PerfilUsuario,
    example: PerfilUsuario.USUARIO,
    description: 'Perfil de acesso do usuário',
  })
  @Column({ type: 'varchar', length: 10, default: PerfilUsuario.USUARIO })
  declare perfil: PerfilUsuario;

  @ApiProperty({
    example: true,
    description: 'Indica se o usuário está ativo',
  })
  @Column({ type: 'boolean', nullable: false, default: true })
  declare ativo: boolean;
}