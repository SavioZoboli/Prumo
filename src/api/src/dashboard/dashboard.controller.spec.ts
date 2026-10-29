import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../auth/roles.decorator';
import { PerfilUsuario } from '../usuarios/perfil.enum';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController — escopo por perfil', () => {
  const service = {
    ultimasMovimentacoes: jest.fn(),
    movimentacoesSemanais: jest.fn(),
    materiaisMaisConsumidos: jest.fn(),
  };
  const controller = new DashboardController(
    service as unknown as DashboardService,
  );

  const requisicao = (perfil: PerfilUsuario) => ({ user: { id: 7, perfil } });

  beforeEach(() => jest.clearAllMocks());

  it('USUARIO vê só as próprias movimentações', async () => {
    const req = requisicao(PerfilUsuario.USUARIO);

    await controller.ultimasMovimentacoes({}, req);
    await controller.movimentacoesSemanais({}, req);
    await controller.materiaisMaisConsumidos({}, req);

    expect(service.ultimasMovimentacoes).toHaveBeenCalledWith({}, 7);
    expect(service.movimentacoesSemanais).toHaveBeenCalledWith({}, 7);
    expect(service.materiaisMaisConsumidos).toHaveBeenCalledWith({}, 7);
  });

  it.each([PerfilUsuario.ADMIN, PerfilUsuario.LIDER])(
    '%s vê as movimentações de todos',
    async (perfil) => {
      const req = requisicao(perfil);

      await controller.ultimasMovimentacoes({}, req);
      await controller.movimentacoesSemanais({}, req);
      await controller.materiaisMaisConsumidos({}, req);

      expect(service.ultimasMovimentacoes).toHaveBeenCalledWith({}, undefined);
      expect(service.movimentacoesSemanais).toHaveBeenCalledWith({}, undefined);
      expect(service.materiaisMaisConsumidos).toHaveBeenCalledWith(
        {},
        undefined,
      );
    },
  );

  it('resumo e itens críticos continuam restritos a ADMIN e LIDER', () => {
    const reflector = new Reflector();
    const perfisDe = (metodo: keyof DashboardController) =>
      reflector.get<PerfilUsuario[]>(
        ROLES_KEY,
        Object.getOwnPropertyDescriptor(DashboardController.prototype, metodo)!
          .value as () => unknown,
      );
    const apenasGestao = [PerfilUsuario.ADMIN, PerfilUsuario.LIDER];

    expect(perfisDe('resumo')).toEqual(apenasGestao);
    expect(perfisDe('itensCriticos')).toEqual(apenasGestao);
    expect(perfisDe('ultimasMovimentacoes')).toBeUndefined();
    expect(perfisDe('materiaisEmFalta')).toBeUndefined();
  });
});
