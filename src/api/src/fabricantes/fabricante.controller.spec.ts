import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../auth/roles.decorator';
import { PerfilUsuario } from '../usuarios/perfil.enum';
import { FabricanteController } from './fabricante.controller';

describe('FabricanteController — permissões por perfil', () => {
  const reflector = new Reflector();
  const perfisDe = (metodo: keyof FabricanteController) =>
    reflector.getAllAndOverride<PerfilUsuario[]>(ROLES_KEY, [
      Object.getOwnPropertyDescriptor(FabricanteController.prototype, metodo)!
        .value as () => unknown,
      FabricanteController,
    ]);

  it('libera a listagem para todos os perfis', () => {
    expect(perfisDe('findAll')).toBeUndefined();
  });

  it('restringe criar, editar e inativar ao ADMIN', () => {
    expect(perfisDe('create')).toEqual([PerfilUsuario.ADMIN]);
    expect(perfisDe('update')).toEqual([PerfilUsuario.ADMIN]);
    expect(perfisDe('desativar')).toEqual([PerfilUsuario.ADMIN]);
  });
});
