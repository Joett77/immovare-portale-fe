import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PlanAndServiceService } from '../../../../public/services/plan-and-service.service';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { PlusIconComponent } from '../../../../shared/atoms/icons/plus-icon/plus-icon.component';
import { SearchIconComponent } from '../../../../shared/atoms/icons/search-icon/search-icon.component';
import { PlanListComponent } from '../plan-list/plan-list.component';
import { ServiceListComponent } from '../service-list/service-list.component';

@Component({
  selector: 'app-plan-service-list',
  standalone: true,
  imports: [
    ButtonComponent,
    PlusIconComponent,
    FormsModule,
    SearchIconComponent,
    CurrencyPipe,
    RouterLink,
    CommonModule,
    ServiceListComponent,
    PlanListComponent,
  ],
  templateUrl: './plan-service-list.component.html',
  styleUrl: './plan-service-list.component.scss',
})
export class PlanServiceListComponent implements OnInit {
  private _planService = inject(PlanAndServiceService);
  plans = this._planService.plansList$;
  service = this._planService.serviceList$;

  activeTab = signal<'plan' | 'service'>('plan');


  async ngOnInit() {

    await this._planService.getPlan();
    await this._planService.getService();
  }

  setActiveTab(tab: 'plan' | 'service') {
    this.activeTab.set(tab);
  }
}
