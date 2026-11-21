import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../auth/roles.decorator';
import { PerfilUsuario } from '../usuarios/perfil.enum';
import { MovimentacaoController } from './movimentacoes.controller';

describe('MovimentacaoController — permissões por perfil', () => {
  const reflector = new Reflector();
  const perfisDe = (metodo: keyof MovimentacaoController) =>
    reflector.getAllAndOverride<PerfilUsuario[]>(ROLES_KEY, [
      Object.getOwnPropertyDescriptor(MovimentacaoController.prototype, metodo)!
        .value as () => unknown,
      MovimentacaoController,
    ]);

  it('libera registrar e consultar movimentações para todos os perfis', () => {
    expect(perfisDe('create')).toBeUndefined();
    expect(perfisDe('findAll')).toBeUndefined();
    expect(perfisDe('findOne')).toBeUndefined();
  });

  it('restringe o estorno a ADMIN e LIDER', () => {
    expect(perfisDe('estornar')).toEqual([
      PerfilUsuario.ADMIN,
      PerfilUsuario.LIDER,
    ]);
  });
});
