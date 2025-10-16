import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroBlockComponent } from '../../../shared/organisms/hero-block/hero-block.component';
import { BannerCtaComponent } from '../../../shared/organisms/banner-cta/banner-cta.component';
import { FaqSellPropertyComponent } from '../../../public/components/sell-property/faq-sell-property/faq-sell-property.component';
import { FAQItem } from '../../models';
import { faqSellItems } from '../../mock/data';
import { Router } from '@angular/router';
interface Step {
  title: string;
  description: string;
}

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, HeroBlockComponent, BannerCtaComponent, FaqSellPropertyComponent],
  templateUrl: './about-us.component.html',
})
export class AboutUsComponent {
  private router = inject(Router);
  bgHero: any;
  title: any;
  subtitle: any;
  faqSellItems: FAQItem[] = faqSellItems;

  steps: Step[] = [
    {
      title: 'Tutto digitale zero intoppi',
      description:
        'Abbiamo digitalizzato e reso più fluidi i processi eliminando tutte quelle attività ripetitive che ti fanno perdere tempo.',
    },
    {
      title: 'Documenti a portata di click',
      description:
        'Abbiamo digitalizzato le scartoffie: ora tutti i documenti di cui hai bisogno sono in ordine e sono facili da trovare.',
    },
    {
      title: 'Tutti i dati in tempo reale',
      description:
        'Grazie alla tecnologia, stiamo creando un sistema basato sui dati così da condividere con te tutte le informazioni in tempo reale.',
    },
    {
      title: 'Pannello di controllo e online',
      description:
        'Abbiamo creato un pannello da cui puoi sempre controllare in tempo reale ciò che accade durante la vendita del tuo immobile..',
    },
    {
      title: 'Comunicazione facilitata',
      description:
        'Grazie alla tecnologia abbiamo creato un processo di vendita tutto nuovo per farti risparmiare tantissimo rispetto alle agenzie tradizionali..',
    },
  ];

  goToValutazioneImmobile() {
    this.router.navigate(['/']);
  }
  goToVoglioVendere() {
    this.router.navigate(['/voglio-vendere']);
  }
}
