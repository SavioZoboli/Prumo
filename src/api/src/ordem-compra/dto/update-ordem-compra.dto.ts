import { OmitType } from '@nestjs/swagger';
import { CreateOrdemCompraDto } from './create-ordem-compra.dto';

/**
 * Atualização de uma ordem de compra em aberto: apenas itens e data prevista
 * de entrega. O fornecedor não pode ser alterado.
 */
export class UpdateOrdemCompraDto extends OmitType(CreateOrdemCompraDto, [
  'fornecedor_id',
] as const) {}