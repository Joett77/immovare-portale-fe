import { Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-toggle-button',
  standalone: true,
  imports: [],
  templateUrl: './toggle-button.component.html',
  styleUrl: './toggle-button.component.scss'
})
export class ToggleButtonComponent {
  changed = output<'3 mesi' | '6 mesi'>();
  duration = signal<'3 mesi' | '6 mesi'>('3 mesi');

  onSwitchchange(event: Event) {
    this.duration.set((event.target as HTMLInputElement).checked ? '6 mesi' : '3 mesi');
    this.changed.emit(this.duration());
  }
}
