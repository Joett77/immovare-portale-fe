// src/app/cms/components/property/property-details-actions-dropdown/property-details-actions-dropdown.component.ts
import { Component, ElementRef, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsIconComponent } from '../../../../shared/atoms/icons/settings-icon/settings-icon.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';

export interface PropertyAction {
  id: string;
  label: string;
  isDanger?: boolean;
}

@Component({
  selector: 'app-property-details-actions-dropdown',
  standalone: true,
  imports: [CommonModule, SettingsIconComponent, ButtonComponent],
  templateUrl: './property-details-actions-dropdown.component.html',
  styleUrls: ['./property-details-actions-dropdown.component.scss'],
})
export class PropertyDetailsActionsDropdownComponent {
  @Input() propertyId: string = '';
  @Output() actionSelected = new EventEmitter<{ actionId: string; propertyId: string }>();

  isOpen = false;

  // Default actions list
  @Input() actions: PropertyAction[] = [
    { id: 'negotiation', label: 'Contrassegna come in trattativa' },
    { id: 'sold', label: 'Contrassegna come venduto' },
    { id: 'hide', label: 'Nascondi annuncio' },
    { id: 'archive', label: 'Archivia annuncio', isDanger: true },
  ];

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  handleAction(action: PropertyAction) {
    this.actionSelected.emit({ actionId: action.id, propertyId: this.propertyId });
    this.isOpen = false;
  }
}
