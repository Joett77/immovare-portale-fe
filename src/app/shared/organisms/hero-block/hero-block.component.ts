import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InputAutocompleteComponent } from '../../../public/components/input-autocomplete/input-autocomplete.component';
import { SelectComponent, SelectOption } from '../../molecules/select/select.component';
import { FormControl } from '@angular/forms';
import { LeafletInputAutocompleteComponent } from '../../../public/components/leaflet-input-autocomplete/leaflet-input-autocomplete.component';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-hero-block',
  standalone: true,
  imports: [
    RouterModule,
    SelectComponent,
    CommonModule,
    InputAutocompleteComponent,
    LeafletInputAutocompleteComponent,
  ],
  templateUrl: './hero-block.component.html',
  styleUrl: './hero-block.component.scss',
})
export class HeroBlockComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  @Input() bgHero: string = '';
  @Input() bgHeroImage: string = '';
  @Input() hasVideo: boolean = false;
  @Input() hasImage: boolean = false;
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() evaluationButton: boolean = false;
  @Input() isPropertyBuy: boolean = false;
  @Input() titleBold: boolean = false;
  @Input() subtitleBold: boolean = false;
  @Input() theme: 'primary' | 'secondary' | 'grey' | 'yellow' = 'primary';
  @Input() selectOptions: SelectOption[] = [];
  @Input() getControl: FormControl<string | null> | null = null;

  address: string = 'Indirizzo';
  selectedValue: string = '';
  private routerSubscription?: Subscription;
  private visibilityChangeHandler?: () => void;

  platformId = inject(PLATFORM_ID);

  colors = {
    yellow: '#F6F5C2',
    primary: '#9FECF2',
    secondary: '#38747C',
    grey: '#EFEFEF',
    default: '#FFFFFF',
  };

  constructor(private router: Router) {
    // Subscribe to router navigation events to handle video playback after navigation
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Delay to ensure DOM is ready after navigation
        setTimeout(() => {
          this.ensureVideoPlaying();
        }, 100);
      });
  }

  ngAfterViewInit(): void {
    if (this.hasVideo) {
      // Initial play attempt
      this.ensureVideoPlaying();

      // Handle page visibility changes (when user switches tabs and comes back)
      this.visibilityChangeHandler = () => {
        if (document.visibilityState === 'visible') {
          this.ensureVideoPlaying();
        }
      };
      document.addEventListener('visibilitychange', this.visibilityChangeHandler);

      // Handle page focus (additional fallback)
      window.addEventListener('focus', () => this.ensureVideoPlaying());

      // Intersection Observer to play video when it comes into view
      if ('IntersectionObserver' in window && this.videoPlayer?.nativeElement) {
        const observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                this.ensureVideoPlaying();
              }
            });
          },
          { threshold: 0.25 }
        );
        observer.observe(this.videoPlayer.nativeElement);
      }
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions and event listeners
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private ensureVideoPlaying(): void {
    if (this.videoPlayer?.nativeElement) {
      const video = this.videoPlayer.nativeElement;

      // Check if video is not already playing
      if (video.paused || video.ended) {
        // Reset video if it has ended
        if (video.ended) {
          video.currentTime = 0;
        }

        // Attempt to play with error handling
        const playPromise = video.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Video playing successfully
              console.log('Video autoplay started successfully');
            })
            .catch(error => {
              console.warn('Video autoplay was prevented:', error);

              // Fallback: Try to play on user interaction
              this.setupUserInteractionPlay();
            });
        }
      }
    }
  }

  private setupUserInteractionPlay(): void {
    // Only run in browser
    if (!isPlatformBrowser(this.platformId) || !this.videoPlayer?.nativeElement) {
      return;
    }

    const video = this.videoPlayer.nativeElement;

    // Play on first user interaction
    const playOnInteraction = () => {
      video
        .play()
        .then(() => {
          // Remove listeners after successful play
          document.removeEventListener('click', playOnInteraction);
          document.removeEventListener('scroll', playOnInteraction);
          document.removeEventListener('touchstart', playOnInteraction);
        })
        .catch(console.error);
    };

    // Add interaction listeners
    document.addEventListener('click', playOnInteraction, { once: true });
    document.addEventListener('scroll', playOnInteraction, { once: true });
    document.addEventListener('touchstart', playOnInteraction, { once: true });
  }

  goToPropertyEvaluation(): void {
    this.router.navigate(['/property-evaluation']);
  }

  onSelectChange(value: string): void {
    this.selectedValue = value;
  }
}
