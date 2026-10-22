import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FornecedorController } from './fornecedor.controller';

describe('FornecedorController — autenticação', () => {
  it('exige login em todas as rotas', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, FornecedorController);

    expect(guards).toContain(JwtAuthGuard);
  });
});
