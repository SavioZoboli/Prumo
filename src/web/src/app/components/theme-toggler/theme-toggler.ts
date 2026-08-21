import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ThemeTogglerService } from '../../services/theme-toggler.service';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-theme-toggler',
  imports: [MatButtonModule, MatIcon],
  templateUrl: './theme-toggler.html',
  styleUrl: './theme-toggler.scss',
})
export class ThemeToggler {

  toggleService = inject(ThemeTogglerService)

}
