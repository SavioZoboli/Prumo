// O jsdom (ambiente dos testes) não implementa window.matchMedia, e o
// ThemeTogglerService usa isso no construtor para detectar o tema do sistema.
// Sem este stub, todo componente que injeta esse service quebra no teste.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
