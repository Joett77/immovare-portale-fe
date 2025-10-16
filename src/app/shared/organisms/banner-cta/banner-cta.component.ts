import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

type iconType = 'user' | 'book' | 'hands';
@Component({
  selector: 'app-banner-cta',
  standalone: true,
  imports: [ButtonComponent, CommonModule],
  templateUrl: './banner-cta.component.html',
  styleUrl: './banner-cta.component.scss',
})
export class BannerCtaComponent {
  private router = inject(Router);
  @Input() title: string = 'Titolo';
  @Input() description: string = 'Descrizione';
  @Input() icon: iconType = `user`;
  @Input() buttonLabel: string = 'Scopri i piani';
  @Output() buttonClick = new EventEmitter<void>();

  onButtonClick(): void {
    this.buttonClick.emit();
  }
}
