import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { OrdemCompra } from "./ordem-compra.entity";
import { OrdemCompraService } from "./ordem-compra-servce";
import { CreateOrdemCompraDto } from "./dto/create-ordem-compra.dto";
import { FiltrarOrdemCompraDto } from "./dto/filtrar-ordem-compra.dto";

@ApiTags('Ordens de Compra')
@Controller('ordens-compra')
export class OrdemCompraController {
  constructor(private readonly ordemCompraService: OrdemCompraService) {}

  @ApiOperation({
    summary: 'Criar uma nova ordem de compra',
  })
  @ApiResponse({
    status: 201,
    description: 'Ordem de compra criada com sucesso.',
    type: OrdemCompra,
  })
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createOrdemCompraDto: CreateOrdemCompraDto,
  ): Promise<OrdemCompra> {
    return this.ordemCompraService.create(createOrdemCompraDto);
  }

  @ApiOperation({
    summary: 'Listar ordens de compra',
    description: 'Aceita filtros combinaveis por material, fornecedor e período de emissão.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ordens de compra.',
    type: [OrdemCompra],
  })
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() filtros: FiltrarOrdemCompraDto) {
    return this.ordemCompraService.findAll(filtros);
  }

  @ApiOperation({ summary: 'Buscar ordem de compra por ID' })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID da ordem de compra',
  })
  @ApiResponse({
    status: 200,
    description: 'Ordem de compra encontrada.',
    type: OrdemCompra,
  })
  @ApiResponse({
    status: 404,
    description: 'Ordem de compra não encontrada.',
  })
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const ordemCompra = await this.ordemCompraService.findOne(id);
    if (!ordemCompra) {
      throw new NotFoundException('Ordem de compra não encontrada.');
    }
    return ordemCompra;
  }

  @ApiOperation({
    summary: 'Registrar o recebimento de uma ordem de compra',
    description: 'Marca a data de entrega efetiva. Ainda não dá baixa no estoque (depende de "Materiais").',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID da ordem de compra',
  })
  @ApiResponse({
    status: 200,
    description: 'Ordem de compra recebida com sucesso.',
    type: OrdemCompra,
  })
  @ApiResponse({
    status: 400,
    description: 'Ordem de compra já recebida.',
  })
  @ApiResponse({
    status: 404,
    description: 'Ordem de compra não encontrada.',
  })
  @Patch(':id/receber')
  @UseGuards(JwtAuthGuard)
  receber(@Param('id', ParseIntPipe) id: number) {
    return this.ordemCompraService.receber(id);
  }
}