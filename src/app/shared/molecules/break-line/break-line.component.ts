import { Component, input } from '@angular/core';

@Component({
  selector: 'app-break-line',
  standalone: true,
  imports: [],
  templateUrl: './break-line.component.html',
  styleUrl: './break-line.component.scss'
})
export class BreakLineComponent {
  marginY = input<string>('0');
}
