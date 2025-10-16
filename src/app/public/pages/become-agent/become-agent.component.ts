import { Component } from '@angular/core';
import { HeroBlockComponent } from '../../../shared/organisms/hero-block/hero-block.component';
import { BannerCtaComponent } from '../../../shared/organisms/banner-cta/banner-cta.component';
import { FaqSellPropertyComponent } from '../../../public/components/sell-property/faq-sell-property/faq-sell-property.component';
import { AssistanceIconComponent } from '../../../shared/atoms/icons/assistance-icon/assistance-icon.component';
import { MailIconComponent } from '../../../shared/atoms/icons/mail-icon/mail-icon.component';
import { TelephoneIconComponent } from '../../../shared/atoms/icons/telephone-icon/telephone-icon.component';
import { RequestInfoComponent } from '../../components/property/request-info/request-info.component';
import { ImmovatoriComponent } from '../../components/become-agent/immovatori/immovatori.component';
import { ImmovareGuaranteesComponent } from '../../components/become-agent/immovare-guarantees/immovare-guarantees.component';

interface Step {
  title: string;
  description: string;
}
@Component({
  selector: 'app-become-agent',
  standalone: true,
  imports: [
    HeroBlockComponent,
    BannerCtaComponent,
    FaqSellPropertyComponent,
    RequestInfoComponent,
    AssistanceIconComponent,
    TelephoneIconComponent,
    MailIconComponent,
    ImmovatoriComponent,
    ImmovareGuaranteesComponent,
  ],
  templateUrl: './become-agent.component.html',
  styleUrls: ['./become-agent.component.scss'],
})
export class BecomeAgentComponent {
  bgHero: any;
  title: any;
  subtitle: any;

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
}
