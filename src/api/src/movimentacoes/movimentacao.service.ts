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
import { Material } from '../materiais/material.entity';
import { AlertaEstoqueService } from '../alertas/alerta-estoque.service';

@Injectable()
export class MovimentacaoService {
  constructor(
    @InjectRepository(Movimentacao)
    private movimentacaoRepository: Repository<Movimentacao>,

    @InjectRepository(Material)
    private materialRepository: Repository<Material>,

    private readonly alertaEstoqueService: AlertaEstoqueService,
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

    const movimentacaoSalva = await this.movimentacaoRepository.manager.transaction(async (manager) => {
      const materialRepository = manager.getRepository(Material);
      const materiaisPorId = new Map<number, Material>();

      for (const item of itens) {
        let material = materiaisPorId.get(item.material_id);

        if (!material) {
          const encontrado = await materialRepository.findOne({
            where: { id: item.material_id },
          });

          if (!encontrado) {
            throw new NotFoundException(
              `Material ${item.material_id} não encontrado.`,
            );
          }

          if (!encontrado.ativo) {
            throw new BadRequestException(
              `Material ${item.material_id} está inativo.`, 
            );
          }

          material = encontrado;
          materiaisPorId.set(item.material_id, material);
        }

        if (operacao === 'S' && item.quantidade > material.estoqueAtual) {
          throw new BadRequestException(
            `Quantidade solicitada de ${item.material_id} é maior que o estoque disponível.`,
          );
        }

        material.estoqueAtual += operacao === 'E' ? item.quantidade : -item.quantidade;
      }

      const materiaisEnvolvidos = [...materiaisPorId.values()];
      await materialRepository.save(materiaisEnvolvidos);

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

      return movimentacaoSalva;
    });

    // Fora da transação e sem await: o alerta só olha estoque já commitado e
    // nem a demora nem a falha do e-mail chegam a quem fez a movimentação.
    void this.alertaEstoqueService.verificarMateriais(
      itens.map((item) => item.material_id),
    );

    return movimentacaoSalva;
  }

  async findAll(filtros: FiltrarMovimentacaoDto = {}): Promise<Movimentacao[]> {
    const qb = this.movimentacaoRepository
      .createQueryBuilder('movimentacao')
      .leftJoinAndSelect('movimentacao.itens', 'item')
      .leftJoinAndSelect('movimentacao.usuario', 'usuario')
      .orderBy('movimentacao.data', 'DESC');

    if (filtros.material_id) {
      
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

  async estornar(id: number, motivoEstorno: string): Promise<Movimentacao> {
    const movimentacao = await this.movimentacaoRepository.findOne({
      where: { id },
      relations: { itens: true },
    });

    if (!movimentacao) {
      throw new NotFoundException('Movimentação não encontrada.');
    }

    if (movimentacao.is_estornado) {
      throw new BadRequestException('Esta movimentação já foi estornada.');
    }

    await this.movimentacaoRepository.manager.transaction(async (manager) => {
      const materialRepository = manager.getRepository(Material);


      for (const item of movimentacao.itens) {
        const material = await materialRepository.findOne({
          where: { id: item.material_id },
        });

        if (material) {
          material.estoqueAtual +=
            movimentacao.operacao === 'E' ? -item.quantidade : item.quantidade;
          await materialRepository.save(material);
        }
      }

      await manager.update(Movimentacao, id, {
        is_estornado: true,
        motivo_estorno: motivoEstorno,
      });
    });

    // Estornar muda o estoque: pode levar ao mínimo (estorno de entrada) ou
    // tirar da situação crítica (estorno de saída).
    void this.alertaEstoqueService.verificarMateriais(
      movimentacao.itens.map((item) => item.material_id),
    );

    return (await this.findOne(id))!;
  }
}
