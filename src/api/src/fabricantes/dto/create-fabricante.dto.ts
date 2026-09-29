import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateFabricanteDto {
  @ApiProperty({
    example: 'Sandvik',
    description: 'Nome do fabricante',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  nome!: string;

  @ApiProperty({
    example: true,
    description: 'Define se o fabricante está ativo',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
