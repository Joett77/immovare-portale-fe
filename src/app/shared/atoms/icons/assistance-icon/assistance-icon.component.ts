import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-assistance-icon',
  standalone: true,
  imports: [],
  templateUrl: './assistance-icon.component.svg',
})
export class AssistanceIconComponent {
  @Input() width: number = 17;
  @Input() height: number = 14;
}
