import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class UpdateFabricanteDto {
  @ApiPropertyOptional({ example: 'Sandvik' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  nome?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
