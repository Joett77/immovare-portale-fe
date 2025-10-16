import { CommonModule, registerLocaleData } from '@angular/common';
import { Component, Input } from '@angular/core';
import localeIt from '@angular/common/locales/it'
import { InfoCircleIcon } from "../../atoms/icons/info-icon/info-circle.component";
registerLocaleData(localeIt, 'it');

@Component({
  selector: 'app-price-label',
  standalone: true,
  imports: [CommonModule, InfoCircleIcon],
  templateUrl: './price-label.component.html',
  styleUrl: './price-label.component.scss'
})
export class PriceLabelComponent {
  @Input() label = {
    label: '',
    info: ''
  };
  @Input() price!: number | string;
  @Input() type: 'small' | 'large' | 'bgColor' | null = null;

}
