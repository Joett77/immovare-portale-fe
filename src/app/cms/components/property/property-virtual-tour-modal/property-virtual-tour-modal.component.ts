// src/app/cms/components/property/property-virtual-tour-modal/property-virtual-tour-modal.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-property-virtual-tour-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 bg-white flex flex-col"
    >
      <div class="p-4 border-b border-[#CBCCCD]">
        <div class="container mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h2 class="heading-md font-bold text-primary-dark">{{ title }}</h2>
          <button
            (click)="onClose()"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form [formGroup]="virtualTourForm">
          <div class="grid grid-cols-1 gap-6">
            <div>
              <p class="text-sm text-gray-500 mb-4">
                Inserisci l'URL del tour virtuale. Questo deve essere un URL di incorporamento
                (embed URL) da servizi come Matterport o altri.
              </p>
              <app-input
                label="URL del tour virtuale"
                [control]="getControl('virtualTourUrl')"
                type="text"
              ></app-input>
            </div>

            <div
              *ngIf="previewUrl"
              class="mt-4"
            >
              <h3 class="text-lg font-semibold mb-2">Anteprima</h3>
              <div class="h-96 bg-gray-100 rounded-sm overflow-hidden">
                <iframe
                  [src]="previewUrl"
                  width="100%"
                  height="100%"
                  frameborder="0"
                  allowfullscreen
                ></iframe>
              </div>
            </div>

            <div class="flex justify-end space-x-4 mt-6">
              <app-button
                [type]="'secondary'"
                [text]="'Annulla'"
                [size]="'md'"
                (buttonClick)="onClose()"
              ></app-button>

              <app-button
                [type]="'primary'"
                [text]="'Salva'"
                [size]="'md'"
                (buttonClick)="saveVirtualTour()"
              ></app-button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class PropertyVirtualTourModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() title = 'Aggiungi tour virtuale';
  @Input() initialVirtualTourUrl: string | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<string | null>();

  virtualTourForm: FormGroup;
  previewUrl: SafeResourceUrl | null = null;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.virtualTourForm = this.fb.group({
      virtualTourUrl: [''],
    });
  }

  ngOnInit(): void {
    if (this.initialVirtualTourUrl) {
      this.virtualTourForm.patchValue({
        virtualTourUrl: this.initialVirtualTourUrl,
      });
      this.updatePreview(this.initialVirtualTourUrl);
    }

    // Update preview when URL changes
    this.virtualTourForm.get('virtualTourUrl')?.valueChanges.subscribe(value => {
      if (value) {
        this.updatePreview(value);
      } else {
        this.previewUrl = null;
      }
    });
  }

  private updatePreview(url: string): void {
    try {
      // Make sure the URL is valid and has a protocol
      let sanitizedUrl = url.trim();
      if (!sanitizedUrl.startsWith('http://') && !sanitizedUrl.startsWith('https://')) {
        sanitizedUrl = 'https://' + sanitizedUrl;
      }
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(sanitizedUrl);
    } catch (error) {
      console.error('Error creating preview URL:', error);
      this.previewUrl = null;
    }
  }

  onClose(): void {
    this.close.emit();
  }

  getControl(name: string): FormControl {
    return this.virtualTourForm.get(name) as FormControl;
  }

  saveVirtualTour(): void {
    if (this.virtualTourForm.valid) {
      let url = this.virtualTourForm.get('virtualTourUrl')?.value;

      // If URL is empty or just whitespace, return null
      if (!url || url.trim() === '') {
        this.save.emit(null);
        return;
      }

      // Make sure URL has a protocol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      this.save.emit(url);
    }
  }
}
