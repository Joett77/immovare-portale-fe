import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-empty-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div>
      <router-outlet></router-outlet>
    </div>
  `,
})
export class EmptyLayoutComponent {}
