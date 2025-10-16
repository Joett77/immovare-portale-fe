import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-image-right-block',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './image-right-block.component.html',
  styleUrl: './image-right-block.component.scss',
})
export class ImageRightBlockComponent {
  private router = inject(Router);

  goToPage() {
    this.router.navigate(['/voglio-vendere']);
  }
}
