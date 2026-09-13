import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** RF12: estorno de movimentacao exige que o usuario informe o motivo. */
export class EstornarMovimentacaoDto {
  @ApiProperty({
    example: 'Estorno solicitado por erro de lançamento',
    description: 'Motivo do estorno',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  motivo_estorno!: string;
}
