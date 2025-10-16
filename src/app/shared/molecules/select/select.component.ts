import { Component, input, output, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

export interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './select.component.html',
})
export class SelectComponent implements OnInit, OnDestroy {
  @ViewChild('selectElement') selectElement!: ElementRef;

  id = input<string>('select');
  withBorder = input<boolean>(false);
  options = input.required<any[]>();
  control = input<FormControl<string | null> | null>();
  label = input<string>('Select an option');
  showPlaceholder = input<boolean>(true);
  errorMessage = input<string>('This field is required');

  selectionChange = output<string>();

  private valueSubscription?: Subscription;

  get isInvalid(): boolean {
    return this.control() ? this.control()!.invalid && this.control()!.touched : false;
  }

  ngOnInit() {
    // Subscribe to control value changes to update the select element
    if (this.control()) {
      this.valueSubscription = this.control()!.valueChanges.subscribe(value => {
      });
    }
  }

  ngOnDestroy() {
    if (this.valueSubscription) {
      this.valueSubscription.unsubscribe();
    }
  }

  onSelectionChange(event: Event) {
    const selectElement = (event.target as HTMLSelectElement).value;
    if (this.control()) {
      this.control()!.setValue(selectElement);
    }
    this.selectionChange.emit(selectElement);
  }
}
