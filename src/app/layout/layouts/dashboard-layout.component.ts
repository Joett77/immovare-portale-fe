import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  template: `
    <div>
      <app-header
        [type]="'slim'"
        class="relative z-40"
      />
      <router-outlet></router-outlet>
      <app-footer type="slim"></app-footer>
    </div>
  `,
})
export class DashboardLayoutComponent {}
