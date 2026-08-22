import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({
    example: 'Letícia',
    description: 'Nome do usuário',
  })
  nome!: string;

  @ApiProperty({
    example: 'Zalasik',
    description: 'Sobrenome do usuário',
  })
  sobrenome!: string;

  @ApiProperty({
    example: 'leticia@email.com',
    description: 'E-mail do usuário',
  })
  email!: string;

  @ApiProperty({
    example: 'leticiaz',
    description: 'Nome de usuário para acesso ao sistema',
  })
  usuario!: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha do usuário',
  })
  senha!: string;

  @ApiProperty({
    example: 'user',
    description: 'Perfil do usuário',
    required: false,
  })
  perfil?: string;

  @ApiProperty({
    example: true,
    description: 'Define se o usuário está ativo',
    required: false,
  })
  ativo?: boolean;
}