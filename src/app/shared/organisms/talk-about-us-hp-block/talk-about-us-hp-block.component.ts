// talk-about-us-hp-block.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // Import isPlatformBrowser
import { Inject, PLATFORM_ID } from '@angular/core'; // Import necessary dependencies

@Component({
  selector: 'app-talk-about-us-hp-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './talk-about-us-hp-block.component.html',
})
export class TalkAboutUsHpBlockComponent {
  isDesktop: boolean;

  reviews = [
    {
      logoSrc: '/assets/icons/propthec360.png',
      logoAlt: 'Proptech360 logo',
      content: '"Immovare.it, l\'agenzia immobiliare basata sulla subscription economy. "',
      isOpen: false,
    },
    {
      logoSrc: '/assets/icons/milano.png',
      logoAlt: 'Milano Finanza logo',
      content: '"Immovare.it, l\'agenzia immobiliare basata sulla subscription economy. ',
      isOpen: false,
    },
    {
      logoSrc: '/assets/icons/adnkronos.png',
      logoAlt: 'Adnkronos logo',
      content: '"Immovare.it, l\'agenzia immobiliare basata sulla subscription economy."',
      isOpen: false,
    },
    {
      logoSrc: '/assets/icons/Libero.png',
      logoAlt: 'Libero logo',
      content: '"Immovare.it, l\'agenzia immobiliare basata sulla subscription economy."',
      isOpen: false,
    },
    {
      logoSrc: '/assets/icons/msn.png',
      logoAlt: 'MSN logo',
      content: '"Immovare.it, l\'agenzia immobiliare basata sulla subscription economy."',
      isOpen: false,
    },
    {
      logoSrc: '/assets/icons/Re2bit.png',
      logoAlt: 'Re2bit logo',
      content: '"Immovare.it, l\'agenzia immobiliare basata sulla subscription economy."',
      isOpen: false,
    },
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Check if running in a browser
    if (isPlatformBrowser(this.platformId)) {
      this.isDesktop = window.innerWidth >= 768; // md breakpoint

      // Listen for window resize to update isDesktop
      window.addEventListener('resize', () => {
        this.isDesktop = window.innerWidth >= 768;
      });
    } else {
      this.isDesktop = false; // Default value for SSR
    }
  }

  toggleAccordion(index: number): void {
    this.reviews[index].isOpen = !this.reviews[index].isOpen;
  }
}
