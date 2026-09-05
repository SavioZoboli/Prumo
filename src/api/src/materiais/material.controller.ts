import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MaterialService } from "./material.service";
import { Material } from "./material.entity";
import { CreateMaterialDto } from "./dto/create-material.dto";
import { UpdateMaterialDto } from "./dto/update-material.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags('Materiais')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('materiais')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @ApiOperation({ summary: 'Criar um novo material' })
  @ApiResponse({
    status: 201,
    description: 'Material criado com sucesso.',
    type: Material,
  })
  @Post()
  async create(
    @Body() createMaterialDto: CreateMaterialDto,
  ): Promise<Material> {
    return this.materialService.create(createMaterialDto);
  }

  @ApiOperation({ summary: 'Listar materiais ativos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de materiais ativos.',
    type: [Material],
  })
  @Get()
  findAll() {
    return this.materialService.findAll();
  }

  @ApiOperation({ summary: 'Buscar material por ID' })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID do material',
  })
  @ApiResponse({
    status: 200,
    description: 'Material encontrado.',
    type: Material,
  })
  @ApiResponse({
    status: 404,
    description: 'Material não encontrado.',
  })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.materialService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar um material' })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID do material',
  })
  @ApiResponse({
    status: 200,
    description: 'Material atualizado com sucesso.',
    type: Material,
  })
  @ApiResponse({
    status: 404,
    description: 'Material não encontrado.',
  })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialService.update(id, updateMaterialDto);
  }

  @ApiOperation({
    summary: 'Desativar um material',
    description: 'Realiza uma exclusão lógica, alterando o campo ativo para false.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID do material',
  })
  @ApiResponse({
    status: 200,
    description: 'Material desativado com sucesso.',
    schema: {
      example: {
        id: 1,
        nome: 'Pastilha CNMG 120408',
        codigo: 'CNMG120408',
        ativo: false,
      },
    },
  })
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.materialService.desativar(id);
  }
}