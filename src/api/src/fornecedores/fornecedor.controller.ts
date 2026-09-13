import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { FornecedorService } from "./fornecedor.service";
import { Fornecedor } from "./fornecedor.entity";
import { CreateFornecedorDto } from "../usuarios/dto/create-fornecedor.dto";
import { UpdateFornecedorDto } from "../usuarios/dto/update-fornecedor.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags('Fornecedores')
@Controller('fornecedores')
export class FornecedorController {
  constructor(private readonly fornecedorService: FornecedorService) {}

  @ApiOperation({ summary: 'Criar um novo fornecedor' })
@ApiResponse({
  status: 201,
  description: 'Fornecedor criado com sucesso.',
  type: Fornecedor,
})
@Post()
@UseGuards(JwtAuthGuard)
async create(
  @Body() createFornecedorDto: CreateFornecedorDto,
): Promise<Fornecedor> {
  return this.fornecedorService.create(createFornecedorDto);
}

 @ApiOperation({ summary: 'Listar fornecedores ativos' })
@ApiResponse({
  status: 200,
  description: 'Lista de fornecedores ativos.',
  type: [Fornecedor],
})
@Get()
@UseGuards(JwtAuthGuard)
findAll() {
  return this.fornecedorService.findAll();
}

 @ApiOperation({ summary: 'Buscar fornecedor por ID' })
@ApiParam({
  name: 'id',
  example: 1,
  description: 'ID do fornecedor',
})
@ApiResponse({
  status: 200,
  description: 'Fornecedor encontrado.',
  type: Fornecedor,
})
@ApiResponse({
  status: 404,
  description: 'Fornecedor não encontrado.',
})
@Get(':id')
@UseGuards(JwtAuthGuard)
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.fornecedorService.findOne(id);
}

  @ApiOperation({ summary: 'Atualizar um fornecedor' })
@ApiParam({
  name: 'id',
  example: 1,
  description: 'ID do fornecedor',
})
@ApiResponse({
  status: 200,
  description: 'Fornecedor atualizado com sucesso.',
  type: Fornecedor,
})
@ApiResponse({
  status: 404,
  description: 'Fornecedor não encontrado.',
})
@Patch(':id')
@UseGuards(JwtAuthGuard)
update(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateFornecedorDto: UpdateFornecedorDto,
) {
  return this.fornecedorService.update(id, updateFornecedorDto);
}

 @ApiOperation({
  summary: 'Desativar um fornecedor',
  description: 'Realiza uma exclusão lógica, alterando o campo ativo para false.',
})
@ApiParam({
  name: 'id',
  example: 1,
  description: 'ID do fornecedor',
})
@ApiResponse({
  status: 200,
  description: 'Fornecedor desativado com sucesso.',
  schema: {
    example: {
      id: 1,
      nome: 'Prumo Ltda',
      cnpj: '33.000.167/0001-01',
      ativo: false,
    },
  },
})
@Delete(':id')
@UseGuards(JwtAuthGuard)
remove(@Param('id', ParseIntPipe) id: number) {
  return this.fornecedorService.desativar(id);
}
}