import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, inject, Input, Output } from '@angular/core';
import { SettingsIconComponent } from '../../atoms/icons/settings-icon/settings-icon.component';

@Component({
  selector: 'app-actions-dropdown',
  standalone: true,
  imports: [CommonModule, SettingsIconComponent],
  templateUrl: './app-actions-dropdown.component.html',
  styleUrls: ['./app-actions-dropdown.component.scss'],
})
export class ActionsDropdownComponent {
  @Input() propertyId: string = '';
  @Input() propertyStatus: string = '';
  @Input() enableModify: boolean = true;
  @Input() type: '' | 'bg' = '';

  @Output() editPropertySteps = new EventEmitter<string>();
  @Output() goToTicket = new EventEmitter<string>();
  @Output() openPlanModal = new EventEmitter<string>();
  @Output() deleteProperty = new EventEmitter<string>();

  private elementRef = inject(ElementRef);

  isOpen = false;

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  onEditPropertySteps() {
    console.log('Property ID:', this.propertyId);
    this.editPropertySteps.emit(this.propertyId);
    this.isOpen = false; // Close the dropdown after selection
  }

  onGoToTicket() {
    this.goToTicket.emit();
    this.isOpen = false;
  }

  onOpenPlanModal() {
    this.openPlanModal.emit();
    this.isOpen = false;
  }

  onDeleteProperty() {
    this.deleteProperty.emit(this.propertyId);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
