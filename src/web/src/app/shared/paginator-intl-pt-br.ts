import { MatPaginatorIntl } from '@angular/material/paginator';

export function criarPaginatorIntlPtBr(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();

  intl.itemsPerPageLabel = 'Itens por página:';
  intl.nextPageLabel = 'Próxima página';
  intl.previousPageLabel = 'Página anterior';
  intl.firstPageLabel = 'Primeira página';
  intl.lastPageLabel = 'Última página';

  intl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    const totalPages = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex =
      startIndex < totalPages ? Math.min(startIndex + pageSize, totalPages) : startIndex + pageSize;

    return `${startIndex + 1} – ${endIndex} de ${length}`;
  };

  return intl;
}
