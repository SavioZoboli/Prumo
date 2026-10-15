import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PerfilUsuario } from '../usuarios/perfil.enum';
import { DashboardService } from './dashboard.service';
import {
  FiltrarItensCriticosDto,
  FiltrarMaisConsumidosDto,
  FiltrarMateriaisDto,
  FiltrarMovimentacoesSemanaisDto,
  FiltrarUltimasMovimentacoesDto,
} from './dto/filtros-dashboard.dto';
import {
  ItensCriticosPaginadosDto,
  MaterialConsumidoDto,
  MateriaisEmFaltaPaginadosDto,
  MovimentacaoSemanalDto,
  ResumoDashboardDto,
  UltimaMovimentacaoDto,
} from './dto/respostas-dashboard.dto';

interface RequisicaoAutenticada {
  user: { id: number; perfil: PerfilUsuario };
}

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // ADMIN e LIDER veem as movimentações de todos; USUARIO, só as próprias.
  private escopoDoUsuario(req: RequisicaoAutenticada): number | undefined {
    return req.user.perfil === PerfilUsuario.USUARIO ? req.user.id : undefined;
  }

  @ApiOperation({
    summary: 'Números dos cards do topo',
    description:
      'Itens abaixo do mínimo, itens em atenção (até 20% acima do mínimo), ordens de compra pendentes e atrasadas.',
  })
  @ApiResponse({ status: 200, type: ResumoDashboardDto })
  @Roles(PerfilUsuario.ADMIN, PerfilUsuario.LIDER)
  @Get('resumo')
  resumo() {
    return this.dashboardService.resumo();
  }

  @ApiOperation({
    summary: 'Itens críticos',
    description:
      'Materiais abaixo do mínimo ou em atenção, do mais crítico para o menos, com busca e paginação.',
  })
  @ApiResponse({ status: 200, type: ItensCriticosPaginadosDto })
  @Roles(PerfilUsuario.ADMIN, PerfilUsuario.LIDER)
  @Get('itens-criticos')
  itensCriticos(@Query() filtros: FiltrarItensCriticosDto) {
    return this.dashboardService.itensCriticos(filtros);
  }

  @ApiOperation({
    summary: 'Materiais em falta',
    description:
      'Versão de itens críticos para todos os perfis: só materiais no mínimo ou abaixo, sem quantidades.',
  })
  @ApiResponse({ status: 200, type: MateriaisEmFaltaPaginadosDto })
  @Get('materiais-em-falta')
  materiaisEmFalta(@Query() filtros: FiltrarMateriaisDto) {
    return this.dashboardService.materiaisEmFalta(filtros);
  }

  @ApiOperation({
    summary: 'Últimas movimentações',
    description:
      'Uma linha por material movimentado, das mais recentes para as mais antigas. Para o perfil USUARIO, só as próprias.',
  })
  @ApiResponse({ status: 200, type: [UltimaMovimentacaoDto] })
  @Get('ultimas-movimentacoes')
  ultimasMovimentacoes(
    @Query() filtros: FiltrarUltimasMovimentacoesDto,
    @Req() req: RequisicaoAutenticada,
  ) {
    return this.dashboardService.ultimasMovimentacoes(
      filtros,
      this.escopoDoUsuario(req),
    );
  }

  @ApiOperation({
    summary: 'Entradas x saídas por semana',
    description:
      'Soma das quantidades por semana (segunda a domingo), sem estornos. Para o perfil USUARIO, só as próprias movimentações.',
  })
  @ApiResponse({ status: 200, type: [MovimentacaoSemanalDto] })
  @Get('movimentacoes-semanais')
  movimentacoesSemanais(
    @Query() filtros: FiltrarMovimentacoesSemanaisDto,
    @Req() req: RequisicaoAutenticada,
  ) {
    return this.dashboardService.movimentacoesSemanais(
      filtros,
      this.escopoDoUsuario(req),
    );
  }

  @ApiOperation({
    summary: 'Materiais mais consumidos',
    description:
      'Ranking por soma das saídas no mês, sem estornos. Para o perfil USUARIO, só as próprias saídas.',
  })
  @ApiResponse({ status: 200, type: [MaterialConsumidoDto] })
  @Get('materiais-mais-consumidos')
  materiaisMaisConsumidos(
    @Query() filtros: FiltrarMaisConsumidosDto,
    @Req() req: RequisicaoAutenticada,
  ) {
    return this.dashboardService.materiaisMaisConsumidos(
      filtros,
      this.escopoDoUsuario(req),
    );
  }
}
