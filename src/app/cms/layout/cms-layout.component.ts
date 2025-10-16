// /src/app/cms/layout/cms-layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsSidebarComponent } from '../components/cms-sidebar/cms-sidebar.component';
import { CmsHeaderComponent } from '../components/cms-header/cms-header.component';

@Component({
  selector: 'app-cms-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, CmsSidebarComponent, CmsHeaderComponent],
  templateUrl: './cms-layout.component.html',
})
export class CmsLayoutComponent {
  // Layout component logic can go here
}
