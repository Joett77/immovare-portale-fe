import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-arrow-left-icon',
  standalone: true,
  imports: [],
  templateUrl: './arrow-left-icon.component.svg',
})
export class ArrowLeftIconComponent {
  @Input() width: number = 17;
  @Input() height: number = 14;
}
