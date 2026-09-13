import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateUsuarioDto {
  @ApiPropertyOptional({ example: 'Letícia Maria' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nome?: string;

  @ApiPropertyOptional({ example: 'Zalasik' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  sobrenome?: string;

  @ApiPropertyOptional({ example: 'leticia@email.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(60)
  email?: string;

  @ApiPropertyOptional({ example: 'novaSenha123' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  senha?: string;

  @ApiPropertyOptional({ enum: PerfilUsuario, example: PerfilUsuario.ADMIN })
  @IsOptional()
  @IsEnum(PerfilUsuario)
  perfil?: PerfilUsuario;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
