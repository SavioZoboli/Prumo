import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrdemCompra } from './ordem-compra.entity';
import { CreateOrdemCompraDto } from './dto/create-ordem-compra.dto';
import { ItemOrdemCompra } from './itens-ordem-compra.entity';
import { FiltrarOrdemCompraDto } from './dto/filtrar-ordem-compra.dto';
// Quando a branch feature/cadastro-materiais-backend for mergeada, este
// arquivo passa a existir em src/api/src/materiais/material.entity.ts.
// import { Material } from '../materiais/material.entity';

@Injectable()
export class OrdemCompraService {
  constructor(
    @InjectRepository(OrdemCompra)
    private ordemCompraRepository: Repository<OrdemCompra>,

    // Tambem precisa registrar TypeOrmModule.forFeature([Material]) (ou
    // importar o MaterialModule, se ele passar a exportar TypeOrmModule)
    // dentro de ordem-compra.module.ts para este InjectRepository funcionar.
    // @InjectRepository(Material)
    // private materialRepository: Repository<Material>,
  ) {}

  async create(createOrdemCompraDto: CreateOrdemCompraDto): Promise<OrdemCompra> {
    const { fornecedor_id, dt_entrega_prevista, itens } = createOrdemCompraDto;

    for (const item of itens) {
      if (item.quantidade <= 0) {
        throw new BadRequestException(
          'A quantidade de cada item deve ser maior que zero.',
        );
      }
      if (item.valor <= 0) {
        throw new BadRequestException(
          'O valor de cada item deve ser maior que zero.',
        );
      }
    }

    // ==== BLOQUEADO ATE "Materiais" SER MERGEADO (branch feature/cadastro-materiais-backend) ====
    // Descomentar isto + o import do Material no topo do arquivo + o
    // @InjectRepository(Material) no construtor, quando o PR do colega
    // (cadastro de materiais) for mergeado. Validar que cada material_id
    // existe e esta ativo antes de gravar a ordem de compra.
    //
    // for (const item of itens) {
    //   const material = await this.materialRepository.findOne({
    //     where: { id: item.material_id },
    //   });
    //
    //   if (!material) {
    //     throw new NotFoundException(`Material ${item.material_id} não encontrado.`);
    //   }
    //
    //   if (!material.ativo) {
    //     throw new BadRequestException(`Material ${item.material_id} está inativo.`);
    //   }
    // }
    // ==== FIM DO BLOQUEIO ====

    const valorTotal = itens.reduce(
      (total, item) => total + item.quantidade * item.valor,
      0,
    );

    return this.ordemCompraRepository.manager.transaction(async (manager) => {
      const ordemCompra = manager.create(OrdemCompra, {
        fornecedor_id,
        dt_emissao: new Date(),
        dt_entrega_prevista: dt_entrega_prevista
          ? new Date(dt_entrega_prevista)
          : null,
        dt_entrega: null,
        valor_total: valorTotal,
      });

      const ordemCompraSalva = await manager.save(ordemCompra);

      const itensSalvos = await manager.save(
        ItemOrdemCompra,
        itens.map((item) =>
          manager.create(ItemOrdemCompra, {
            ordem_compra_id: ordemCompraSalva.id,
            material_id: item.material_id,
            quantidade: item.quantidade,
            valor: item.valor,
          }),
        ),
      );

      ordemCompraSalva.itens = itensSalvos;

      return ordemCompraSalva;
    });
  }

  // Consulta do historico por periodo, material ou fornecedor.
  async findAll(filtros: FiltrarOrdemCompraDto = {}): Promise<OrdemCompra[]> {
    const qb = this.ordemCompraRepository
      .createQueryBuilder('ordemCompra')
      .leftJoinAndSelect('ordemCompra.itens', 'item')
      .leftJoinAndSelect('ordemCompra.fornecedor', 'fornecedor')
      .orderBy('ordemCompra.dt_emissao', 'DESC');

    if (filtros.material_id) {
      // Filtra pelas ordens de compra que TEM aquele material entre os
      // itens, sem duplicar a linha da capa (por isso subquery, e nao um
      // join direto).
      qb.andWhere(
        `ordemCompra.id IN (
          SELECT ioc.ordem_compra_id FROM "Itens_Ordem_Compra" ioc WHERE ioc.material_id = :materialId
        )`,
        { materialId: filtros.material_id },
      );
    }

    if (filtros.fornecedor_id) {
      qb.andWhere('ordemCompra.fornecedor_id = :fornecedorId', {
        fornecedorId: filtros.fornecedor_id,
      });
    }

    if (filtros.dataInicio && filtros.dataFim) {
      qb.andWhere('ordemCompra.dt_emissao BETWEEN :dataInicio AND :dataFim', {
        dataInicio: new Date(filtros.dataInicio),
        dataFim: new Date(filtros.dataFim),
      });
    } else if (filtros.dataInicio) {
      qb.andWhere('ordemCompra.dt_emissao >= :dataInicio', {
        dataInicio: new Date(filtros.dataInicio),
      });
    } else if (filtros.dataFim) {
      qb.andWhere('ordemCompra.dt_emissao <= :dataFim', {
        dataFim: new Date(filtros.dataFim),
      });
    }

    return qb.getMany();
  }

  async findOne(id: number): Promise<OrdemCompra | null> {
    return this.ordemCompraRepository.findOne({
      where: { id },
      relations: {
        itens: true,
        fornecedor: true,
      },
    });
  }

  // Recebimento da ordem de compra: marca a data de entrega efetiva.
  async receber(id: number): Promise<OrdemCompra> {
    const ordemCompra = await this.ordemCompraRepository.findOne({ where: { id } });

    if (!ordemCompra) {
      throw new NotFoundException('Ordem de compra não encontrada.');
    }

    if (ordemCompra.dt_entrega) {
      throw new BadRequestException('Esta ordem de compra já foi recebida.');
    }

    // ==== BLOQUEADO ATE "Materiais" SER MERGEADO ====
    // Ao receber, dar baixa no estoque de cada material (RF06) e, se fizer
    // sentido no fluxo, gerar automaticamente uma Movimentacao de entrada
    // vinculada via ordem_compra_id (rel Movimentacoes_Ordens_Compra).
    // ==== FIM DO BLOQUEIO ====

    await this.ordemCompraRepository.update(id, {
      dt_entrega: new Date(),
    });

    return (await this.findOne(id))!;
  }
}