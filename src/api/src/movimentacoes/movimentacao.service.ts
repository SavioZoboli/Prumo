import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Movimentacao } from './movimentacao.entity';
import { ItemMovimento } from './item-movimento.entity';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';
import { FiltrarMovimentacaoDto } from './dto/filtrar-movimentacao.dto';
import { Material } from '../materiais/material.entity';

@Injectable()
export class MovimentacaoService {
  constructor(
    @InjectRepository(Movimentacao)
    private movimentacaoRepository: Repository<Movimentacao>,

    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
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

    return this.movimentacaoRepository.manager.transaction(async (manager) => {
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

      for (const material of materiaisEnvolvidos) {
        if (material.estoqueAtual <= material.estoqueMinimo) {
          // TODO: chamar o servico de envio de e-mail aos usuarios ADMIN/LIDER.
          // Ainda nao existe um servico de e-mail no projeto (sem nodemailer/
          // mailer module) — precisa ser criado antes de implementar isto.
        }
      }

      return movimentacaoSalva;
    });
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
  await this.movimentacaoRepository.manager.transaction(async (manager) => {
    // Lock sem relations: FOR UPDATE não funciona com LEFT JOIN no Postgres
    const movimentacao = await manager.findOne(Movimentacao, {
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });

    if (!movimentacao) {
      throw new NotFoundException('Movimentação não encontrada.');
    }

    if (movimentacao.is_estornado) {
      throw new BadRequestException('Esta movimentação já foi estornada.');
    }

    const itens = await manager.find(ItemMovimento, {
      where: { movimento_id: id },
    });

    const materiais = await manager.find(Material, {
      where: { id: In(itens.map((i) => i.material_id)) },
      order: { id: 'ASC' },
      lock: { mode: 'pessimistic_write' },
    });
    const materiaisPorId = new Map(materiais.map((m) => [m.id, m]));

    for (const item of itens) {
      const material = materiaisPorId.get(item.material_id);

      if (!material) {
        throw new NotFoundException(
          `Material ${item.material_id} não encontrado.`,
        );
      }

      // Estorno de Entrada tira do estoque; estorno de Saída devolve
      const delta =
        movimentacao.operacao === 'E' ? -item.quantidade : item.quantidade;

      if (material.estoqueAtual + delta < 0) {
        throw new BadRequestException(
          `Estorno inviável: o material ${item.material_id} não tem estoque suficiente para reverter a entrada.`,
        );
      }

      material.estoqueAtual += delta;
    }

    await manager.save(materiais);

    await manager.update(Movimentacao, id, {
      is_estornado: true,
      motivo_estorno: motivoEstorno,
    });
  });

  return (await this.findOne(id))!;
}
}
