import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../auth/roles.decorator';
import { PerfilUsuario } from '../usuarios/perfil.enum';
import { MaterialController } from './material.controller';

describe('MaterialController — permissões por perfil', () => {
  const reflector = new Reflector();
  const perfisDe = (metodo: keyof MaterialController) =>
    reflector.getAllAndOverride<PerfilUsuario[]>(ROLES_KEY, [
      Object.getOwnPropertyDescriptor(MaterialController.prototype, metodo)!
        .value as () => unknown,
      MaterialController,
    ]);

  it('libera a leitura para todos os perfis', () => {
    expect(perfisDe('findAll')).toBeUndefined();
    expect(perfisDe('findOne')).toBeUndefined();
    expect(perfisDe('getRelatorioMinimo')).toBeUndefined();
  });

  it('restringe criar, editar e inativar a ADMIN e LIDER', () => {
    const gestao = [PerfilUsuario.ADMIN, PerfilUsuario.LIDER];

    expect(perfisDe('create')).toEqual(gestao);
    expect(perfisDe('update')).toEqual(gestao);
    expect(perfisDe('remove')).toEqual(gestao);
  });
});
