// feature-button.component.ts - Fixed to trigger validation updates
import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, model, Type, ChangeDetectorRef } from '@angular/core';
import { PropertyBuyService } from '../../../public/services/property-buy.service';

@Component({
  selector: 'app-feature-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature-button.component.html',
})
export class FeatureButtonComponent {
  private cdr = inject(ChangeDetectorRef);

  propertyBuyService = inject(PropertyBuyService);
  id = input<number>(0);
  label = input<string>('Appartamento');
  icon = input<Type<any>>();
  isSelected = model<boolean>(false);
  selectedItemId = model<number | null>(null);

  constructor() {
    effect(
      () => {
        if (this.propertyBuyService.isReset()) {
          this.selectedItemId.set(null);
          this.cdr.detectChanges();
        }
      },
      { allowSignalWrites: true }
    );
  }

  selectItem(id: number) {
    const wasSelected = this.selectedItemId() === id;

    if (wasSelected) {
      this.selectedItemId.set(null);
      this.propertyBuyService.isReset.set(false);
    } else {
      this.selectedItemId.set(id);
      this.propertyBuyService.isReset.set(false);
    }

    // Force change detection
    this.cdr.detectChanges();

    // Dispatch a custom event to notify parent components of the selection change
    // This helps trigger validation updates in the parent components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('featureButtonChanged', {
          detail: {
            id,
            label: this.label(),
            selected: !wasSelected,
            timestamp: Date.now(),
          },
        })
      );
    }

    // Also trigger a more specific event for step validation
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('stepValidationTrigger', {
            detail: {
              component: 'feature-button',
              action: wasSelected ? 'deselected' : 'selected',
              id,
            },
          })
        );
      }
    }, 50);
  }
}
