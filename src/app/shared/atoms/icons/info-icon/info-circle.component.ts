import { Component, Input, input, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-info-circle-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="relative inline-block cursor-pointer"
      (mouseenter)="onDesktop && showTooltip()"
      (mouseleave)="onDesktop && hideTooltip()"
      (click)="!onDesktop && toggleTooltip()"
    >
      <svg
        width="12"
        height="13"
        viewBox="0 0 12 13"
        fill="none"
      >
        <path
          d="M6 0.5C9.30469 0.5 12 3.19531 12 6.5C12 9.82812 9.30469 12.5 6 12.5C2.67187 12.5 0 9.82812 0 6.5C0 3.19531 2.67188 0.5 6 0.5ZM6 11.375C8.67188 11.375 10.875 9.19531 10.875 6.5C10.875 3.82813 8.67188 1.625 6 1.625C3.30469 1.625 1.125 3.82812 1.125 6.5C1.125 9.19531 3.30469 11.375 6 11.375ZM6.9375 8.375C7.24219 8.375 7.5 8.63281 7.5 8.9375C7.5 9.26562 7.24219 9.5 6.9375 9.5H5.0625C4.73437 9.5 4.5 9.26562 4.5 8.9375C4.5 8.63281 4.73437 8.375 5.0625 8.375H5.4375L5.4375 6.875H5.25C4.92188 6.875 4.6875 6.64062 4.6875 6.3125C4.6875 6.00781 4.92188 5.75 5.25 5.75H6C6.30469 5.75 6.5625 6.00781 6.5625 6.3125L6.5625 8.375H6.9375ZM6 5C5.57812 5 5.25 4.67188 5.25 4.25C5.25 3.85156 5.57812 3.5 6 3.5C6.39844 3.5 6.75 3.85156 6.75 4.25C6.75 4.67188 6.39844 5 6 5Z"
          [attr.fill]="fillColor()"
        />
      </svg>

      @if (tooltipVisible && infoText) {
        <div
          class="tooltip-box absolute bg-secondary-light border text-black text-xs rounded py-1 px-2 z-10"
        >
          {{ infoText }}
        </div>
      }
    </div>
  `,
  styles: [
    `
      .tooltip-box {
        bottom: 125%; /* Position above the icon */
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap; /* Keep text on one line */
        /* You might want to add transition for a smoother appearance */
        transition: opacity 0.2s ease-in-out;
        opacity: 1; /* Make it visible */
      }

      /* Additional styles for better mobile user experience, e.g., wider padding */
      @media (max-width: 768px) {
        /* Adjust breakpoint as needed */
        .tooltip-box {
          bottom: 125%; /* Adjust positioning if needed for mobile */
          /* Consider making it full width or adding more padding */
          padding: 8px 12px;
          text-align: center;
        }
      }
    `,
  ],
})
export class InfoCircleIcon implements OnInit, OnDestroy {
  @Input() infoText: string | undefined;
  fillColor = input<string>('#3C3D3E');
  tooltipVisible = false;
  onDesktop = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkIfDesktop();
      window.addEventListener('resize', this.onResize);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.onResize);
    }
  }

  // Method to show the tooltip
  showTooltip(): void {
    this.tooltipVisible = true;
  }

  // Method to hide the tooltip
  hideTooltip(): void {
    this.tooltipVisible = false;
  }

  // Method to toggle tooltip visibility (for mobile click)
  toggleTooltip(): void {
    this.tooltipVisible = !this.tooltipVisible;
  }

  // Check if it's a desktop environment (arbitrary breakpoint)
  private checkIfDesktop = (): void => {
    // You can adjust the breakpoint (e.g., 768px for tablets/desktops)
    this.onDesktop = window.innerWidth > 768;
  };

  // Handle window resize to re-evaluate desktop status
  private onResize = (): void => {
    this.checkIfDesktop();
  };
}
