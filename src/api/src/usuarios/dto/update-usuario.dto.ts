import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUsuarioDto {
  @ApiPropertyOptional({ example: 'Letícia Maria' })
  nome?: string;

  @ApiPropertyOptional({ example: 'Zalasik' })
  sobrenome?: string;

  @ApiPropertyOptional({ example: 'leticia@email.com' })
  email?: string;

  @ApiPropertyOptional({ example: 'leticiaz' })
  usuario?: string;

  @ApiPropertyOptional({ example: 'novaSenha123' })
  senha?: string;

  @ApiPropertyOptional({ example: 'admin' })
  perfil?: string;

  @ApiPropertyOptional({ example: true })
  ativo?: boolean;
}