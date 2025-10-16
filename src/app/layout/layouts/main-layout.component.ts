import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  template: `
    <div>
      <app-header
        [type]="'slim'"
        class="relative z-999"
      />
      <router-outlet></router-outlet>
      <app-footer type="full"></app-footer>
    </div>
  `,
})
export class MainLayoutComponent {}
