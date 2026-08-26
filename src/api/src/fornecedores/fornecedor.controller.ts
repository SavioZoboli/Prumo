import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
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
findOne(@Param('id') id: number) {
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
update(
  @Param('id') id: number,
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
      cnpj: '12.345.678/0001-90',
      ativo: false,
    },
  },
})
@Delete(':id')
remove(@Param('id') id: number) {
  return this.fornecedorService.desativar(id);
}
}