import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TicketAssistanceService } from './ticket-assistance.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TicketNotificationService {
  private ticketService = inject(TicketAssistanceService);

  private ticketsUnread = signal<string[]>([]);
  readonly ticketsUnread$ = this.ticketsUnread.asReadonly()
  private intervalId: any = null;

  constructor() {
    this.getTicketsUnread();

    this.intervalId = setInterval(() => {
      this.getTicketsUnread();
    }, 10000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  getTicketsUnread() {
    this.ticketService.getTicketsUnread()
      .subscribe(ticketsUnread => this.ticketsUnread.set(ticketsUnread));
  }
}
