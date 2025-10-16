import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-arrow-right-icon',
  standalone: true,
  imports: [],
  templateUrl: './arrow-right-icon.component.svg',
})
export class ArrowRightIconComponent {
  @Input() width: number = 17;
  @Input() height: number = 14;
}
