import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PerfilUsuario } from '../perfil.enum';

export class CreateUsuarioDto {
  @ApiProperty({
    example: 'Letícia',
    description: 'Nome do usuário',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nome!: string;

  @ApiProperty({
    example: 'Zalasik',
    description: 'Sobrenome do usuário',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  sobrenome!: string;

  @ApiProperty({
    example: 'leticia@email.com',
    description: 'E-mail do usuário',
  })
  @IsEmail()
  @MaxLength(60)
  email!: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha do usuário',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  senha!: string;

  @ApiProperty({
    enum: PerfilUsuario,
    example: PerfilUsuario.USUARIO,
    description: 'Perfil do usuário',
    required: false,
  })
  @IsOptional()
  @IsEnum(PerfilUsuario)
  perfil?: PerfilUsuario;

  @ApiProperty({
    example: true,
    description: 'Define se o usuário está ativo',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}