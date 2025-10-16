import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/atoms/button/button.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-small',
  standalone: true,
  imports: [CommonModule, ButtonComponent, FormsModule],
  templateUrl: './modal-small.component.html',
  styleUrl: './modal-small.component.scss',
})
export class ModalSmallComponent {
  @Input() params: any;
  @Input() loading: boolean = false;
  @Input() modalType:
    | 'reset-password'
    | 'delete-request'
    | 'restore'
    | 'enable'
    | 'disable'
    | 'delete'
    | 'restore-subscription'
    | 'delete-subscription'
    | 'update-profile'
    | 'update-password'
    | 'delete-element'
    | 'delete-plan'
    | 'disable-plan'
    | 'enable-plan'
    | 'update-plan'
    | 'delete-service'
    | 'update-service'
    | 'create-bpm'
    | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onAction = new EventEmitter<null | string>();

  constructor() {
    document.body.classList.add('no-overflow');
  }

  close(): void {
    document.body.classList.remove('no-overflow');
    this.onClose.emit();
  }

  action(toEmit?: string): void {
    document.body.classList.remove('no-overflow');
    this.onAction.emit(toEmit);
  }
}
