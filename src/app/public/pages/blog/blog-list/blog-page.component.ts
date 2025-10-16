import { Component } from '@angular/core';
import { BlogListComponent } from '../../../components/blog/blog-list/blog-list.component';
import { HeroBlockComponent } from '../../../../shared/organisms/hero-block/hero-block.component';
import { StepperBlockComponent } from '../../../../shared/organisms/stepper-block/stepper-block.component';

@Component({
  selector: 'app-blog-page',
  standalone: true,
  imports: [BlogListComponent, HeroBlockComponent, StepperBlockComponent],
  templateUrl: './blog-page.component.html',
  styleUrl: './blog-page.component.scss',
})
export class BlogPageComponent {}
