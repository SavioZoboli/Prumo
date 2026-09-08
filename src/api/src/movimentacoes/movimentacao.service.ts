import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Movimentacao } from './movimentacao.entity';
import { ItemMovimento } from './item-movimento.entity';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';
import { FiltrarMovimentacaoDto } from './dto/filtrar-movimentacao.dto';
// Quando a branch feature/cadastro-materiais-backend for mergeada, este
// arquivo passa a existir em src/api/src/materiais/material.entity.ts.
// import { Material } from '../materiais/material.entity';

@Injectable()
export class MovimentacaoService {
  constructor(
    @InjectRepository(Movimentacao)
    private movimentacaoRepository: Repository<Movimentacao>,

    // Tambem precisa registrar TypeOrmModule.forFeature([Material]) (ou
    // importar o MaterialModule, se ele passar a exportar TypeOrmModule)
    // dentro de movimentacao.module.ts para este InjectRepository funcionar.
    // @InjectRepository(Material)
    // private materialRepository: Repository<Material>,
  ) {}

  async create(
    createMovimentacaoDto: CreateMovimentacaoDto,
    usuarioId: number,
  ): Promise<Movimentacao> {
    const { operacao, motivo, ordem_producao, ordem_compra_id, itens } =
      createMovimentacaoDto;

    if (!['E', 'S'].includes(operacao)) {
      throw new BadRequestException(
        'A operação deve ser E (Entrada) ou S (Saída).',
      );
    }

    for (const item of itens) {
      if (item.quantidade <= 0) {
        throw new BadRequestException(
          'A quantidade de cada item deve ser maior que zero.',
        );
      }
    }

    // ==== BLOQUEADO ATE "Materiais" SER MERGEADO (branch feature/cadastro-materiais-backend) ====
    // Descomentar isto + o import do Material no topo do arquivo + o
    // @InjectRepository(Material) no construtor, quando o PR do colega
    // (cadastro de materiais) for mergeado. Nomes de campo ja conferidos
    // contra a entity real dele (Material.entity.ts): estoqueAtual e
    // estoqueMinimo, em camelCase (coluna no banco e' estoque_atual/estoque_minimo,
    // mas o TypeORM expoe pela propriedade em camelCase). Agora e' por item,
    // ja que uma movimentacao pode ter varios materiais.
    //
    // const materiaisEnvolvidos: Material[] = [];
    // for (const item of itens) {
    //   const material = await this.materialRepository.findOne({
    //     where: { id: item.material_id },
    //   });
    //
    //   if (!material) {
    //     throw new NotFoundException(
    //       `Material ${item.material_id} não encontrado.`, // RN06
    //     );
    //   }
    //
    //   if (!material.ativo) {
    //     throw new BadRequestException(
    //       `Material ${item.material_id} está inativo.`, // RN06
    //     );
    //   }
    //
    //   if (operacao === 'S' && item.quantidade > material.estoqueAtual) {
    //     throw new BadRequestException(
    //       `Quantidade solicitada de ${item.material_id} é maior que o estoque disponível.`, // RN03
    //     );
    //   }
    //
    //   material.estoqueAtual += operacao === 'E' ? item.quantidade : -item.quantidade; // RF06
    //   materiaisEnvolvidos.push(material);
    // }
    // await this.materialRepository.save(materiaisEnvolvidos);
    // ==== FIM DO BLOQUEIO ====

    // Capa + itens precisam ser gravados juntos: se um item falhar, a
    // movimentacao inteira nao pode ficar registrada pela metade.
    return this.movimentacaoRepository.manager.transaction(async (manager) => {
      const movimentacao = manager.create(Movimentacao, {
        operacao,
        motivo,
        ordem_producao: ordem_producao ?? null,
        ordem_compra_id: ordem_compra_id ?? null,
        usuario_id: usuarioId,
        data: new Date(),
        is_estornado: false,
        motivo_estorno: null,
      });

      const movimentacaoSalva = await manager.save(movimentacao);

      const itensSalvos = await manager.save(
        ItemMovimento,
        itens.map((item) =>
          manager.create(ItemMovimento, {
            movimento_id: movimentacaoSalva.id,
            material_id: item.material_id,
            quantidade: item.quantidade,
          }),
        ),
      );

      movimentacaoSalva.itens = itensSalvos;

      // ==== BLOQUEADO ATE "Materiais" SER MERGEADO ====
      // RF08: decisao ja tomada com a Leticia - ADMIN e LIDER sempre recebem
      // o alerta (nao precisa de tabela de responsaveis por material).
      // for (const material of materiaisEnvolvidos) {
      //   if (material.estoqueAtual <= material.estoqueMinimo) {
      //     // TODO: chamar o servico de envio de e-mail aos usuarios ADMIN/LIDER.
      //   }
      // }
      // ==== FIM DO BLOQUEIO ====

      return movimentacaoSalva;
    });
  }

  // RF09: consulta do historico por periodo, material ou tipo de operacao.
  async findAll(filtros: FiltrarMovimentacaoDto = {}): Promise<Movimentacao[]> {
    const qb = this.movimentacaoRepository
      .createQueryBuilder('movimentacao')
      .leftJoinAndSelect('movimentacao.itens', 'item')
      .leftJoinAndSelect('movimentacao.usuario', 'usuario')
      .orderBy('movimentacao.data', 'DESC');

    if (filtros.material_id) {
      // Filtra pelas movimentacoes que TEM aquele material entre os itens,
      // sem duplicar a linha da capa (por isso subquery, e nao um join direto).
      qb.andWhere(
        `movimentacao.id IN (
          SELECT im.movimento_id FROM "Itens_Movimento" im WHERE im.material_id = :materialId
        )`,
        { materialId: filtros.material_id },
      );
    }

    if (filtros.operacao) {
      qb.andWhere('movimentacao.operacao = :operacao', { operacao: filtros.operacao });
    }

    if (filtros.dataInicio && filtros.dataFim) {
      qb.andWhere('movimentacao.data BETWEEN :dataInicio AND :dataFim', {
        dataInicio: new Date(filtros.dataInicio),
        dataFim: new Date(filtros.dataFim),
      });
    } else if (filtros.dataInicio) {
      qb.andWhere('movimentacao.data >= :dataInicio', {
        dataInicio: new Date(filtros.dataInicio),
      });
    } else if (filtros.dataFim) {
      qb.andWhere('movimentacao.data <= :dataFim', {
        dataFim: new Date(filtros.dataFim),
      });
    }

    return qb.getMany();
  }

  async findOne(id: number): Promise<Movimentacao | null> {
    return this.movimentacaoRepository.findOne({
      where: { id },
      relations: {
        itens: true,
        usuario: true,
      },
    });
  }

  // RF12: estorno da movimentacao, com motivo obrigatorio.
  async estornar(id: number, motivoEstorno: string): Promise<Movimentacao> {
    const movimentacao = await this.movimentacaoRepository.findOne({ where: { id } });

    if (!movimentacao) {
      throw new NotFoundException('Movimentação não encontrada.');
    }

    if (movimentacao.is_estornado) {
      throw new BadRequestException('Esta movimentação já foi estornada.');
    }

    // ==== BLOQUEADO ATE "Materiais" SER MERGEADO ====
    // RF12: reverte no estoque o efeito de CADA item desta movimentacao
    // (o inverso do que "create" fez: E vira -quantidade, S vira +quantidade).
    // const itens = await this.itemMovimentoRepository.find({ where: { movimento_id: id } });
    // for (const item of itens) {
    //   const material = await this.materialRepository.findOne({ where: { id: item.material_id } });
    //   if (material) {
    //     material.estoqueAtual +=
    //       movimentacao.operacao === 'E' ? -item.quantidade : item.quantidade;
    //     await this.materialRepository.save(material);
    //   }
    // }
    // ==== FIM DO BLOQUEIO ====
    await this.movimentacaoRepository.update(id, {
      is_estornado: true,
      motivo_estorno: motivoEstorno,
    });

    return (await this.findOne(id))!;
  }
}
