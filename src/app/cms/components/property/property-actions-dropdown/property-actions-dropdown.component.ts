// /src/app/cms/components/property-actions-dropdown/property-actions-dropdown.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsIconComponent } from '../../../../shared/atoms/icons/settings-icon/settings-icon.component';

@Component({
  selector: 'app-property-actions-dropdown',
  standalone: true,
  imports: [CommonModule, SettingsIconComponent],
  template: `
    <div class="relative inline-block text-left">
      <button
        (click)="toggleMenu()"
        [class.bg-[#ECE81A]]="isOpen"
        class="bg-white hover:bg-[#FCFBD9] text-[#3C3D3E] text-sm font-bold px-4 py-2 rounded flex items-center space-x-2"
      >
        <app-settings-icon class="w-4 h-4"></app-settings-icon>
        <span>Azioni</span>
      </button>

      <div
        *ngIf="isOpen"
        class="absolute right-0 mt-2 w-56 shadow-xl origin-top-right bg-white ring-1 ring-black ring-opacity-5 z-20 border-black border"
      >
        <div class="py-1">
          <a
            (click)="onEditProperty()"
            class="block px-4 py-2 text-sm text-[#3C3D3E] hover:bg-[#FCFBD9] font-semibold cursor-pointer"
          >
            Modifica annuncio
          </a>
          <ng-container *ngIf="canApprove">
            <a
              (click)="onApproveProperty()"
              class="block px-4 py-2 text-sm text-[#3C3D3E] hover:bg-[#FCFBD9] font-semibold cursor-pointer"
            >
              Approva annuncio
            </a>
          </ng-container>
          <div class="border-t border-gray-300 my-1"></div>
          <a
            (click)="onDeleteProperty()"
            class="block px-4 py-2 text-sm text-red-600 hover:bg-red-100 font-semibold cursor-pointer"
          >
            Elimina annuncio
          </a>
        </div>
      </div>
    </div>
  `,
})
export class PropertyActionsDropdownComponent {
  @Input() propertyId: string = '';
  @Input() status: string = ''; // Used to conditionally show approve option

  @Output() editProperty = new EventEmitter<string>();
  @Output() viewProperty = new EventEmitter<string>();
  @Output() approveProperty = new EventEmitter<string>();
  @Output() deleteProperty = new EventEmitter<string>();

  isOpen = false;

  get canApprove(): boolean {
    return this.status === 'In approvazione';
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  onEditProperty() {
    this.editProperty.emit(this.propertyId);
    this.isOpen = false;
  }

  onViewProperty() {
    this.viewProperty.emit(this.propertyId);
    this.isOpen = false;
  }

  onApproveProperty() {
    this.approveProperty.emit(this.propertyId);
    this.isOpen = false;
  }

  onDeleteProperty() {
    this.deleteProperty.emit(this.propertyId);
    this.isOpen = false;
  }
}
