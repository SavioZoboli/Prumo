import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { MovimentacaoService } from "./movimentacao.service";
import { Movimentacao } from "./movimentacao.entity";
import { CreateMovimentacaoDto } from "./dto/create-movimentacao.dto";
import { FiltrarMovimentacaoDto } from "./dto/filtrar-movimentacao.dto";
import { EstornarMovimentacaoDto } from "./dto/estornar-movimentacao.dto";

@ApiTags('Movimentações')
@Controller('movimentacoes')
export class MovimentacaoController {
  constructor(private readonly movimentacaoService: MovimentacaoService) {}

    @ApiOperation({
    summary: 'Criar uma nova movimentação',
  })
  @ApiResponse({
    status: 201,
    description: 'Movimentação criada com sucesso.',
    type: Movimentacao,
  })
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createMovimentacaoDto: CreateMovimentacaoDto,
    @Req() req: Request,
  ): Promise<Movimentacao> {
    const usuarioId = (req as any).user.id;
    return this.movimentacaoService.create(
      createMovimentacaoDto,
      usuarioId,
    );
  }

 @ApiOperation({
  summary: 'Listar movimentações',
  description: 'RF09: aceita filtros combinaveis por material, operação e período.',
})
@ApiResponse({
  status: 200,
  description: 'Lista de movimentações.',
  type: [Movimentacao],
})
@Get()
@UseGuards(JwtAuthGuard)
findAll(@Query() filtros: FiltrarMovimentacaoDto) {
  return this.movimentacaoService.findAll(filtros);
}

 @ApiOperation({ summary: 'Buscar movimentação por ID' })
@ApiParam({
  name: 'id',
  example: 1,
  description: 'ID da movimentação',
})
@ApiResponse({
  status: 200,
  description: 'Movimentação encontrada.',
  type: Movimentacao,
})
@ApiResponse({
  status: 404,
  description: 'Movimentação não encontrada.',
})
@Get(':id')
@UseGuards(JwtAuthGuard)
async findOne(@Param('id', ParseIntPipe) id: number) {
  const movimentacao = await this.movimentacaoService.findOne(id);
  if (!movimentacao) {
    throw new NotFoundException('Movimentação não encontrada.');
  }
  return movimentacao;
}

@ApiOperation({
  summary: 'Estornar uma movimentação',
  description: 'RF12: exige o motivo do estorno. Ainda não reverte o estoque (depende de "Materiais").',
})
@ApiParam({
  name: 'id',
  example: 1,
  description: 'ID da movimentação',
})
@ApiResponse({
  status: 200,
  description: 'Movimentação estornada com sucesso.',
  type: Movimentacao,
})
@ApiResponse({
  status: 400,
  description: 'Movimentação já estornada.',
})
@ApiResponse({
  status: 404,
  description: 'Movimentação não encontrada.',
})
@Patch(':id/estorno')
@UseGuards(JwtAuthGuard)
estornar(
  @Param('id', ParseIntPipe) id: number,
  @Body() estornarDto: EstornarMovimentacaoDto,
) {
  return this.movimentacaoService.estornar(id, estornarDto.motivo_estorno);
}
}