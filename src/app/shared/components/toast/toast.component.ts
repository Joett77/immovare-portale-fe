// src/app/shared/components/toast/toast.component.ts
import { Component, Input, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="fixed z-50 top-6 inset-x-0 flex justify-center">
      <div
        class="flex items-center gap-2 px-5 py-4 rounded border-[1px] border-black"
        [class.bg-green-100]="type === 'success'"
        [class.border-black]="type === 'success'"
        [class.border]="type === 'success'"
        [class.bg-red-100]="type === 'error'"
        [class.border-black]="type === 'error'"
        [class.border]="type === 'error'"
      >
        <div class="flex-shrink-0">
          <fa-icon
            *ngIf="type === 'success'"
            [icon]="successIcon"
            class="text-black"
            size="lg"
          >
          </fa-icon>
          <fa-icon
            *ngIf="type === 'error'"
            [icon]="errorIcon"
            class="text-black"
            size="lg"
          >
          </fa-icon>
        </div>
        <span class="text-lg font-bold text-black">{{ message }}</span>
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
export class ToastComponent implements OnInit, OnDestroy {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' = 'success';
  @Input() duration: number = 3000;

  visible: boolean = false;
  private timeout: any;

  // FontAwesome icons
  successIcon = faCheckCircle;
  errorIcon = faTimesCircle;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.show();
  }

  ngOnDestroy(): void {
    this.clearTimeout();
  }

  private show(): void {
    this.visible = true;
    this.setTimeout();
  }

  private hide(): void {
    this.visible = false;
    setTimeout(() => {
      this.el.nativeElement.remove();
    }, 300); // Match animation duration
  }

  private setTimeout(): void {
    this.clearTimeout();
    this.timeout = setTimeout(() => {
      this.hide();
    }, this.duration);
  }

  private clearTimeout(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
}
