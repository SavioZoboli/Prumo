import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from './usuario.entity';
import { PerfilUsuario } from './perfil.enum';

@Entity('Logs_Perfil')
export class LogPerfil {
  @ApiProperty({
    example: 1,
    description: 'Identificador único do log',
  })
  @PrimaryGeneratedColumn('identity', {
    type: 'smallint',
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'Logs_Perfil_pk',
  })
  declare id: number;

  @ApiProperty({
    example: 1,
    description: 'Identificador do usuário que realizou a alteração',
  })
  @Column({ type: 'smallint' })
  declare operador_id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'operador_id', foreignKeyConstraintName: 'fk_operador_id' })
  declare operador: Usuario;

  @ApiProperty({
    example: 2,
    description: 'Identificador do usuário que teve o perfil alterado',
  })
  @Column({ type: 'smallint' })
  declare alvo_id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'alvo_id', foreignKeyConstraintName: 'fk_alvo_id' })
  declare alvo: Usuario;

  @ApiProperty({
    enum: PerfilUsuario,
    example: PerfilUsuario.USUARIO,
    description: 'Perfil antes da alteração',
  })
  @Column({ type: 'varchar', length: 10 })
  declare perfil_anterior: PerfilUsuario;

  @ApiProperty({
    enum: PerfilUsuario,
    example: PerfilUsuario.LIDER,
    description: 'Perfil depois da alteração',
  })
  @Column({ type: 'varchar', length: 10 })
  declare perfil_atual: PerfilUsuario;

  @ApiProperty({
    example: '2026-08-27T10:30:00Z',
    description: 'Data e hora da alteração',
  })
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  declare data: Date;
}
