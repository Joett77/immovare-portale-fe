// src/app/cms/pages/blog/blog.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './blog.component.html',
})
export class BlogComponent {}
