import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FabricanteService } from './fabricante.service';
import { Fabricante } from './fabricante.entity';
import { CreateFabricanteDto } from './dto/create-fabricante.dto';
import { UpdateFabricanteDto } from './dto/update-fabricante.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PerfilUsuario } from '../usuarios/perfil.enum';

@ApiTags('Fabricantes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(PerfilUsuario.ADMIN, PerfilUsuario.LIDER)
@Controller('fabricantes')
export class FabricanteController {
  constructor(private readonly fabricanteService: FabricanteService) {}

  @ApiOperation({ summary: 'Criar um novo fabricante' })
  @ApiResponse({
    status: 201,
    description: 'Fabricante criado com sucesso.',
    type: Fabricante,
  })
  @ApiResponse({
    status: 409,
    description: 'Já existe um fabricante com esse nome.',
  })
  @Post()
  async create(
    @Body() createFabricanteDto: CreateFabricanteDto,
  ): Promise<Fabricante> {
    return this.fabricanteService.create(createFabricanteDto);
  }

  @ApiOperation({ summary: 'Listar fabricantes ativos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de fabricantes ativos.',
    type: [Fabricante],
  })
  @Get()
  findAll() {
    return this.fabricanteService.findAll();
  }

  @ApiOperation({
    summary: 'Atualizar um fabricante',
    description: 'Restrito ao perfil ADMIN.',
  })
  @ApiParam({ name: 'id', example: 1, description: 'ID do fabricante' })
  @ApiResponse({
    status: 200,
    description: 'Fabricante atualizado com sucesso.',
    type: Fabricante,
  })
  @ApiResponse({ status: 404, description: 'Fabricante não encontrado.' })
  @ApiResponse({
    status: 409,
    description: 'Já existe um fabricante com esse nome.',
  })
  @Roles(PerfilUsuario.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFabricanteDto: UpdateFabricanteDto,
  ) {
    return this.fabricanteService.update(id, updateFabricanteDto);
  }

  @ApiOperation({
    summary: 'Desativar um fabricante',
    description:
      'Exclusão lógica (is_ativo = false). O fabricante deixa de aparecer na listagem, mas os materiais já vinculados a ele continuam intactos. Restrito ao perfil ADMIN.',
  })
  @ApiParam({ name: 'id', example: 1, description: 'ID do fabricante' })
  @ApiResponse({
    status: 200,
    description: 'Fabricante desativado com sucesso.',
    type: Fabricante,
  })
  @ApiResponse({ status: 404, description: 'Fabricante não encontrado.' })
  @Roles(PerfilUsuario.ADMIN)
  @Delete(':id')
  desativar(@Param('id', ParseIntPipe) id: number) {
    return this.fabricanteService.desativar(id);
  }
}
