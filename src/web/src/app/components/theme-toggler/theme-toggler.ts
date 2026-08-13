import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ThemeTogglerService } from '../../services/theme-toggler.service';

@Component({
  selector: 'app-theme-toggler',
  imports: [MatButtonModule],
  templateUrl: './theme-toggler.html',
  styleUrl: './theme-toggler.scss',
})
export class ThemeToggler {

  toggleService = inject(ThemeTogglerService)

}
