// /src/app/shared/action/guide-actions-dropdown/guide-actions-dropdown.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsIconComponent } from '../../atoms/icons/settings-icon/settings-icon.component';

@Component({
  selector: 'app-guide-actions-dropdown',
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

      <!-- Menu dropdown -->
      <div
        *ngIf="isOpen"
        class="absolute right-0 mt-2 w-56 shadow-xl origin-top-right bg-white ring-1 ring-black ring-opacity-5 z-20 border-black border"
      >
        <div class="py-1">
          <a
            (click)="onEditGuide(); $event.preventDefault()"
            class="block px-4 py-2 text-sm text-[#3C3D3E] hover:bg-[#FCFBD9] font-semibold cursor-pointer"
          >
            Modifica
          </a>
          <a
            (click)="onPreviewGuide(); $event.preventDefault()"
            class="block px-4 py-2 text-sm text-[#3C3D3E] hover:bg-[#FCFBD9] font-semibold cursor-pointer"
          >
            Anteprima
          </a>
          <a
            (click)="onDuplicateGuide(); $event.preventDefault()"
            class="block px-4 py-2 text-sm text-[#3C3D3E] hover:bg-[#FCFBD9] font-semibold cursor-pointer"
          >
            Duplica
          </a>
          <div class="border-t border-gray-300 my-1"></div>
          <a
            (click)="onDeleteGuide(); $event.preventDefault()"
            class="block px-4 py-2 text-sm text-red-600 hover:bg-[#FCFBD9] font-semibold cursor-pointer"
          >
            Elimina
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
  ],
})
export class GuideActionsDropdownComponent {
  @Input() guideId: string = '';
  @Output() editGuide = new EventEmitter<string>();
  @Output() previewGuide = new EventEmitter<string>();
  @Output() duplicateGuide = new EventEmitter<string>();
  @Output() deleteGuide = new EventEmitter<string>();

  isOpen = false;

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  onEditGuide(): void {
    this.editGuide.emit(this.guideId);
    this.isOpen = false;
  }

  onPreviewGuide(): void {
    this.previewGuide.emit(this.guideId);
    this.isOpen = false;
  }

  onDuplicateGuide(): void {
    this.duplicateGuide.emit(this.guideId);
    this.isOpen = false;
  }

  onDeleteGuide(): void {
    this.deleteGuide.emit(this.guideId);
    this.isOpen = false;
  }
}
