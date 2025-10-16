import { Component } from '@angular/core';
import { BlogPageComponent } from './pages/blog/blog-list/blog-page.component';
import { BlogListComponent } from './components/blog/blog-list/blog-list.component';
import { BlogCardComponent } from './components/blog/blog-card/blog-card.component';

@Component({
  selector: 'app-public',
  standalone: true,
  imports: [BlogPageComponent],
  templateUrl: './public.component.html'
})
export class PublicComponent {}
