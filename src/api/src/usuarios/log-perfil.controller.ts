import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PerfilUsuario } from './perfil.enum';
import { LogPerfilService } from './log-perfil.service';
import { LogPerfil } from './log-perfil.entity';

@ApiTags('Logs de Perfil')
@Controller('logs-perfil')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(PerfilUsuario.ADMIN)
export class LogPerfilController {
  constructor(private readonly logPerfilService: LogPerfilService) {}

  @ApiOperation({ summary: 'Listar alterações de perfil, mais recentes primeiro' })
  @ApiResponse({
    status: 200,
    description: 'Lista de alterações de perfil.',
    type: [LogPerfil],
  })
  @Get()
  findAll() {
    return this.logPerfilService.findAll();
  }

  @ApiOperation({ summary: 'Buscar uma alteração de perfil por ID' })
  @ApiParam({ name: 'id', example: 1, description: 'ID do log' })
  @ApiResponse({
    status: 200,
    description: 'Alteração de perfil encontrada.',
    type: LogPerfil,
  })
  @ApiResponse({ status: 404, description: 'Log não encontrado.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.logPerfilService.findOne(id);
  }
}
