import { Component, input } from '@angular/core';

@Component({
  selector: 'app-modal-full-screen',
  standalone: true,
  imports: [],
  templateUrl: './modal-full-screen.component.html',
  styleUrl: './modal-full-screen.component.scss',
})
export class ModalFullScreenComponent {
  open = input<boolean>(false);
}
