import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-header-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <div>
      <app-header
        [type]="'slim'"
        class="relative z-40"
      />
      <router-outlet></router-outlet>
    </div>
  `,
})
export class HeaderLayoutComponent {}
