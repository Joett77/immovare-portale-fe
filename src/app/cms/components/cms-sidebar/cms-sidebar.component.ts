// src/app/cms/components/cms-sidebar/cms-sidebar.component.ts
import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBookOpen,
  faChartLine,
  faHome,
  faList,
  faNewspaper,
  faTags,
  faUserTag,
  faMessage,
} from '@fortawesome/free-solid-svg-icons';

import { LogoComponent } from '../../../layout/logo/logo.component';
import { AuthService } from '../../../public/services/auth.service';
import { TicketNotificationService } from '../../../public/services/ticket-notification.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  active?: boolean;
  roles?: string[];
}

@Component({
  selector: 'app-cms-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, LogoComponent],
  templateUrl: './cms-sidebar.component.html',
})
export class CmsSidebarComponent {
  private ticketNotificationService = inject(TicketNotificationService);
  protected unreadTicketList: string[] = [];

  faHome = faHome;
  faList = faList;
  faTags = faTags;
  faNewspaper = faNewspaper;
  faUserTag = faUserTag;
  faBookOpen = faBookOpen;
  faChartLine = faChartLine;
  faMessage = faMessage;

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/cms/dashboard',
      icon: 'dashboard',
    },
    {
      label: 'Gestione annunci',
      route: '/cms/annunci',
      icon: 'gestione-annunci',
    },
    {
      label: 'Gestione blog',
      route: '/cms/blog',
      icon: 'gestione-blog',
      roles: ['ADMIN', 'OPERATOR'],
    },
    {
      label: 'Gestione library',
      route: '/cms/guide',
      icon: 'gestione-library',
      roles: ['ADMIN', 'OPERATOR'],
    },
    {
      label: 'Iscrizioni e abbonamenti',
      route: '/cms/iscrizioni-abbonamenti',
      icon: 'iscrizioni',
      roles: ['ADMIN', 'OPERATOR'],
    },
    {
      label: 'Piani e servizi',
      route: '/cms/plans-and-service',
      icon: 'iscrizioni',
      roles: ['ADMIN', 'OPERATOR'],
    },
    {
      label: 'Ticket manager',
      route: '/cms/ticket-assistance',
      icon: 'ticket-manager',
    },
  ];

  private ticketEffect = effect(() => {
    this.unreadTicketList = this.ticketNotificationService.ticketsUnread$();
  });

  constructor(authService: AuthService) {
    this.navItems.forEach(navItem => {
      navItem.active = navItem.roles ? navItem.roles.some(role => authService.hasRole(role)) : true;
    });
  }

  isActive(route: string): boolean {
    return window.location.pathname.includes(route);
  }
}
