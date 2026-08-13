import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { OverlayContainer } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root'
})
export class ThemeTogglerService {
  // Injeção de dependências moderna
  private document = inject(DOCUMENT);
  private overlayContainer = inject(OverlayContainer);
  private platformId = inject(PLATFORM_ID);

  // Estado global reativo
  isDarkTheme = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();
    }

    // O effect reage automaticamente sempre que o valor de isDarkTheme mudar
    effect(() => {
      this.applyTheme(this.isDarkTheme());
    });
  }

  toggleTheme() {
    this.isDarkTheme.update(isDark => !isDark);
  }

  private initializeTheme() {
    const storedTheme = localStorage.getItem('app-theme');
    
    if (storedTheme) {
      this.isDarkTheme.set(storedTheme === 'dark');
    } else {
      // Se não há preferência salva, verifica o tema do sistema operacional
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkTheme.set(prefersDark);
    }
  }

  private applyTheme(isDark: boolean) {
  const themeClass = isDark ? 'dark-theme' : 'light-theme';
  const previousClass = isDark ? 'light-theme' : 'dark-theme';

  // Aplica a classe diretamente na tag <html> (documentElement)
  this.document.documentElement.classList.add(themeClass);
  this.document.documentElement.classList.remove(previousClass);

  if (isPlatformBrowser(this.platformId)) {
    localStorage.setItem('app-theme', isDark ? 'dark' : 'light');
  }
}
}