import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Material } from '../materiais/material.entity';
import { Movimentacao } from '../movimentacoes/movimentacao.entity';
import { OrdemCompra } from '../ordem-compra/ordem-compra.entity';
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
import {
  FUSO_HORARIO,
  MARGEM_ATENCAO,
  classificarEstoque,
  classificarFalta,
  faixaDoStatus,
  type FaixaCritica,
  hojeNoFuso,
  inicioDoMesSeguinte,
  mesAtualNoFuso,
  semanasAte,
  somarDias,
} from './dashboard.regras';

const meiaNoiteNoFuso = (parametro: string) =>
  `(CAST(:${parametro} AS date)::timestamp AT TIME ZONE '${FUSO_HORARIO}')`;

type Numerico = string | number;

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,

    @InjectRepository(Movimentacao)
    private readonly movimentacaoRepository: Repository<Movimentacao>,

    @InjectRepository(OrdemCompra)
    private readonly ordemCompraRepository: Repository<OrdemCompra>,
  ) {}

  async resumo(): Promise<ResumoDashboardDto> {
    const estoque = await this.materialRepository
      .createQueryBuilder('material')
      .select(
        'COUNT(*) FILTER (WHERE material.estoque_atual <= material.estoque_minimo)',
        'abaixo',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE material.estoque_atual > material.estoque_minimo
           AND material.estoque_atual <= material.estoque_minimo * CAST(:fator AS numeric))`,
        'atencao',
      )
      .where('material.ativo = true')
      .setParameter('fator', 1 + MARGEM_ATENCAO)
      .getRawOne<{ abaixo: Numerico; atencao: Numerico }>();

    const ordens = await this.ordemCompraRepository
      .createQueryBuilder('oc')
      .select('COUNT(*)', 'pendentes')
      .addSelect(
        `COUNT(*) FILTER (WHERE (oc.dt_entrega_prevista AT TIME ZONE 'UTC')::date < CAST(:hoje AS date))`,
        'atrasadas',
      )
      .where('oc.dt_entrega IS NULL')
      .setParameter('hoje', hojeNoFuso())
      .getRawOne<{ pendentes: Numerico; atrasadas: Numerico }>();

    return {
      itensAbaixoMinimo: Number(estoque?.abaixo ?? 0),
      itensEmAtencao: Number(estoque?.atencao ?? 0),
      ordensCompraPendentes: Number(ordens?.pendentes ?? 0),
      ordensCompraAtrasadas: Number(ordens?.atrasadas ?? 0),
    };
  }

  async itensCriticos(
    filtros: FiltrarItensCriticosDto,
  ): Promise<ItensCriticosPaginadosDto> {
    const { linhas, ...paginacao } = await this.buscarCriticos(
      filtros,
      faixaDoStatus(filtros.status),
    );

    return {
      itens: linhas.map((linha) => ({
        id: Number(linha.id),
        codigo: linha.codigo,
        nome: linha.nome,
        unidadeMedida: linha.unidadeMedida,
        estoqueAtual: Number(linha.estoqueAtual),
        estoqueMinimo: Number(linha.estoqueMinimo),
        status: classificarEstoque(
          Number(linha.estoqueAtual),
          Number(linha.estoqueMinimo),
        ),
      })),
      ...paginacao,
    };
  }

  async materiaisEmFalta(
    filtros: FiltrarMateriaisDto,
  ): Promise<MateriaisEmFaltaPaginadosDto> {
    const { linhas, ...paginacao } = await this.buscarCriticos(
      filtros,
      faixaDoStatus('ABAIXO_MINIMO'),
    );

    return {
      itens: linhas.map((linha) => ({
        id: Number(linha.id),
        codigo: linha.codigo,
        nome: linha.nome,
        status: classificarFalta(Number(linha.estoqueAtual)),
      })),
      ...paginacao,
    };
  }

  private async buscarCriticos(
    filtros: FiltrarMateriaisDto,
    faixa: FaixaCritica,
  ) {
    const pagina = filtros.pagina ?? 1;
    const limite = filtros.limite ?? 6;

    const consulta = this.materialRepository
      .createQueryBuilder('material')
      .where('material.ativo = true')
      .andWhere(
        'material.estoque_atual <= material.estoque_minimo * CAST(:ate AS numeric)',
        { ate: faixa.ate },
      );

    if (faixa.acimaDoMinimo) {
      consulta.andWhere('material.estoque_atual > material.estoque_minimo');
    }

    const busca = filtros.busca?.trim();
    if (busca) {
      consulta.andWhere(
        "(material.nome ILIKE :busca ESCAPE '\\' OR material.codigo ILIKE :busca ESCAPE '\\')",
        { busca: `%${busca.replace(/[\\%_]/g, '\\$&')}%` },
      );
    }

    const total = await consulta.clone().getCount();

    const linhas = await consulta
      .select('material.id', 'id')
      .addSelect('material.codigo', 'codigo')
      .addSelect('material.nome', 'nome')
      .addSelect('material.unidade_medida', 'unidadeMedida')
      .addSelect('material.estoque_atual', 'estoqueAtual')
      .addSelect('material.estoque_minimo', 'estoqueMinimo')
      .orderBy(
        'material.estoque_atual::numeric / NULLIF(material.estoque_minimo, 0)',
        'ASC',
        'NULLS FIRST',
      )
      .addOrderBy('material.nome', 'ASC')
      .offset((pagina - 1) * limite)
      .limit(limite)
      .getRawMany<{
        id: Numerico;
        codigo: string;
        nome: string;
        unidadeMedida: string | null;
        estoqueAtual: Numerico;
        estoqueMinimo: Numerico;
      }>();

    return { linhas, total, pagina, limite };
  }

  private consultaMovimentacoes(
    usuarioId?: number,
  ): SelectQueryBuilder<Movimentacao> {
    const consulta = this.movimentacaoRepository.createQueryBuilder('mov');
    if (usuarioId !== undefined) {
      consulta.andWhere('mov.usuario_id = :usuarioId', { usuarioId });
    }
    return consulta;
  }

  async ultimasMovimentacoes(
    filtros: FiltrarUltimasMovimentacoesDto,
    usuarioId?: number,
  ): Promise<UltimaMovimentacaoDto[]> {
    const linhas = await this.consultaMovimentacoes(usuarioId)
      .innerJoin('mov.itens', 'item')
      .innerJoin('item.material', 'material')
      .innerJoin('mov.usuario', 'usuario')
      .select('mov.id', 'movimentacaoId')
      .addSelect('mov.data', 'data')
      .addSelect('mov.operacao', 'operacao')
      .addSelect('material.id', 'materialId')
      .addSelect('material.nome', 'material')
      .addSelect('item.quantidade', 'quantidade')
      .addSelect("usuario.nome || ' ' || usuario.sobrenome", 'usuario')
      .addSelect('mov.ordem_producao', 'ordemProducao')
      .addSelect('mov.is_estornado', 'estornado')
      .orderBy('mov.data', 'DESC')
      .addOrderBy('mov.id', 'DESC')
      .addOrderBy('material.nome', 'ASC')
      .limit(filtros.limite ?? 5)
      .getRawMany<
        Omit<
          UltimaMovimentacaoDto,
          'movimentacaoId' | 'materialId' | 'quantidade'
        > & {
          movimentacaoId: Numerico;
          materialId: Numerico;
          quantidade: Numerico;
        }
      >();

    return linhas.map((linha) => ({
      ...linha,
      movimentacaoId: Number(linha.movimentacaoId),
      materialId: Number(linha.materialId),
      quantidade: Number(linha.quantidade),
    }));
  }

  async movimentacoesSemanais(
    filtros: FiltrarMovimentacoesSemanaisDto,
    usuarioId?: number,
  ): Promise<MovimentacaoSemanalDto[]> {
    const semanas = semanasAte(
      filtros.dataReferencia ?? hojeNoFuso(),
      filtros.semanas ?? 6,
    );
    const inicio = semanas[0].inicio;
    const fimExclusivo = somarDias(semanas[semanas.length - 1].fim, 1);

    const linhas = await this.consultaMovimentacoes(usuarioId)
      .innerJoin('mov.itens', 'item')
      .select(
        `to_char(date_trunc('week', mov.data AT TIME ZONE '${FUSO_HORARIO}'), 'YYYY-MM-DD')`,
        'semana',
      )
      .addSelect('mov.operacao', 'operacao')
      .addSelect('SUM(item.quantidade)', 'quantidade')
      .andWhere('mov.is_estornado = false')
      .andWhere(`mov.data >= ${meiaNoiteNoFuso('inicio')}`, { inicio })
      .andWhere(`mov.data < ${meiaNoiteNoFuso('fimExclusivo')}`, {
        fimExclusivo,
      })
      .groupBy('semana')
      .addGroupBy('mov.operacao')
      .getRawMany<{ semana: string; operacao: string; quantidade: Numerico }>();

    const totalDe = (semana: string, operacao: string) =>
      Number(
        linhas.find((l) => l.semana === semana && l.operacao === operacao)
          ?.quantidade ?? 0,
      );

    return semanas.map(({ inicio, fim }) => ({
      inicio,
      fim,
      entradas: totalDe(inicio, 'E'),
      saidas: totalDe(inicio, 'S'),
    }));
  }

  async materiaisMaisConsumidos(
    filtros: FiltrarMaisConsumidosDto,
    usuarioId?: number,
  ): Promise<MaterialConsumidoDto[]> {
    const mes = filtros.mes ?? mesAtualNoFuso();

    const linhas = await this.consultaMovimentacoes(usuarioId)
      .innerJoin('mov.itens', 'item')
      .innerJoin('item.material', 'material')
      .select('material.id', 'materialId')
      .addSelect('material.codigo', 'codigo')
      .addSelect('material.nome', 'nome')
      .addSelect('material.unidade_medida', 'unidadeMedida')
      .addSelect('SUM(item.quantidade)', 'quantidade')
      .andWhere("mov.operacao = 'S'")
      .andWhere('mov.is_estornado = false')
      .andWhere(`mov.data >= ${meiaNoiteNoFuso('inicio')}`, {
        inicio: `${mes}-01`,
      })
      .andWhere(`mov.data < ${meiaNoiteNoFuso('fim')}`, {
        fim: inicioDoMesSeguinte(mes),
      })
      .groupBy('material.id')
      .orderBy('quantidade', 'DESC')
      .addOrderBy('material.nome', 'ASC')
      .limit(filtros.limite ?? 5)
      .getRawMany<
        Omit<MaterialConsumidoDto, 'materialId' | 'quantidade'> & {
          materialId: Numerico;
          quantidade: Numerico;
        }
      >();

    return linhas.map((linha) => ({
      ...linha,
      materialId: Number(linha.materialId),
      quantidade: Number(linha.quantidade),
    }));
  }
}
