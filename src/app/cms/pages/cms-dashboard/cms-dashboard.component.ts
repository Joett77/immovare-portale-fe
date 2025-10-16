// /src/app/cms/pages/cms-dashboard/cms-dashboard.component.ts
import { Component, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTags,
  faNewspaper,
  faArrowRight,
  faBookOpen,
  faList,
  faMessage,
  faUserTag,
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { ButtonComponent } from '../../../shared/atoms/button/button.component';
import { AuthService } from '../../../public/services/auth.service';
import { TicketNotificationService } from '../../../public/services/ticket-notification.service';

interface DashboardCard {
  title: string;
  description: string;
  icon: IconDefinition;
  route: string;
  buttonText: string;
  roles?: string[];
}

@Component({
  selector: 'app-cms-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, ButtonComponent],
  templateUrl: './cms-dashboard.component.html',
  styleUrls: ['./cms-dashboard.component.scss'],
})
export class CmsDashboardComponent implements OnInit {
  // FontAwesome icons
  faArrowRight = faArrowRight;
  private router = inject(Router);
  private ticketNotificationService = inject(TicketNotificationService);
  protected unreadTicketList: string[] = [];

  private ticketEffect = effect(() => {
    this.unreadTicketList = this.ticketNotificationService.ticketsUnread$()
  })

  dashboardCards: DashboardCard[] = [
    {
      title: 'Gestione annunci',
      description:
        'Visualizza e gestisci gli annunci pubblicati sul portale e le richieste di pubblicazione.',
      icon: faList,
      route: '/cms/annunci',
      buttonText: 'Vai alla sezione',
    },
    {
      title: 'Piani e servizi',
      description: 'Configura e gestisci i piani in abbonamento e i servizi singoli.',
      icon: faTags,
      route: '/cms/plans-and-service',
      buttonText: 'Vai alla sezione',
      roles: ['ADMIN', 'OPERATOR'],
    },
    {
      title: 'Gestione blog',
      description: 'Gestisci e pubblica gli articoli del blog.',
      icon: faNewspaper,
      route: '/cms/blog',
      buttonText: 'Vai alla sezione',
      roles: ['ADMIN', 'OPERATOR'],
    },
    {
      title: 'Gestione library',
      description: 'Gestisci e pubblica le guide.',
      icon: faBookOpen,
      route: '/cms/guide',
      buttonText: 'Vai alla sezione',
      roles: ['ADMIN', 'OPERATOR'],
    },
    {
      title: 'Iscrizioni e abbonamenti',
      description: 'Gestisci e pubblica le guide.',
      icon: faUserTag,
      route: '/cms/iscrizioni-abbonamenti',
      buttonText: 'Vai alla sezione',
      roles: ['ADMIN', 'OPERATOR'],
    },
    {
      title: 'Ticket manager',
      description: 'Visualizza e gestisci i ticket aperti dagli utenti del portale.',
      icon: faMessage,
      route: '/cms/ticket-assistance',
      buttonText: 'Vai alla sezione',
    },
  ];

  constructor(authService: AuthService) {
    this.dashboardCards = this.dashboardCards.filter(card => card.roles ? card.roles.some(role => authService.hasRole(role)) : true)
  }

  ngOnInit(): void {
    // Component initialization logic here
  }
  navigateTo(route: string): void {
    // Logic to navigate to the specified route
    this.router.navigate([route]);
  }
}
