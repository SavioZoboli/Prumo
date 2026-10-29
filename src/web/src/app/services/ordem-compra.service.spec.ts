import { TestBed } from '@angular/core/testing';

import { OrdemCompraService } from './ordem-compra.service';

describe('OrdemCompraService', () => {
  let service: OrdemCompraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdemCompraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
