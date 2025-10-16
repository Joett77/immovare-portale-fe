import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PaymentService } from '../../service/payment.service';
import { ButtonComponent } from '../../../shared/atoms/button/button.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule, ButtonComponent, FaIconComponent],
  templateUrl: './checkout-success.component.html',
  styleUrl: './checkout-success.component.scss',
})
export class CheckoutSuccessComponent implements OnInit {
  paymentService = inject(PaymentService);
  session = signal<any | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * Metodo chiamato al momento dell'inizializzazione del componente.
   * Recupera il parametro `session_id` dai query param e richiama il metodo per ottenere i dati della sessione.
   */
  ngOnInit(): void {
    let sessino_id = this.route.snapshot.queryParamMap.get('session_id');
    if (sessino_id) {
      this.getSessionData(sessino_id);
    }
  }

  /**
   * Recupera i dati della sessione utilizzando l'ID della sessione.
   * @param session_id - L'ID della sessione da recuperare.
   */
  async getSessionData(session_id: string | null) {
    this.session.set(await this.paymentService.getSessionById(session_id));
  }

  goToAdvSettings() {
    const advId =
      this.session().subscription != null
        ? this.session().subscription.metadata.advertisementId
        : this.session().payment_intent.metadata.advertisementId;
    this.router.navigate(['/dashboard/annuncio/', advId]);
  }
}
