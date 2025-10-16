import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tag-label',
  standalone: true,
  imports: [],
  templateUrl: './tag-label.component.html',
})
export class TagLabelComponent {
  @Input() text: string = '';
  @Input() link: string = '';
}
