import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ROLES_KEY } from '../auth/roles.decorator';
import { PerfilUsuario } from './perfil.enum';
import { UsuarioController } from './usuario.controller';

describe('UsuarioController — autenticação e perfis', () => {
  const metodo = (nome: keyof UsuarioController) =>
    Object.getOwnPropertyDescriptor(UsuarioController.prototype, nome)!
      .value as () => unknown;

  it('exige login em todas as rotas', () => {
    for (const nome of ['create', 'findAll', 'findOne', 'update', 'remove'] as const) {
      expect(Reflect.getMetadata(GUARDS_METADATA, metodo(nome))).toContain(JwtAuthGuard);
    }
  });

  it('restringe criar e listar usuários ao ADMIN', () => {
    expect(Reflect.getMetadata(ROLES_KEY, metodo('create'))).toEqual([PerfilUsuario.ADMIN]);
    expect(Reflect.getMetadata(ROLES_KEY, metodo('findAll'))).toEqual([PerfilUsuario.ADMIN]);
  });
});
