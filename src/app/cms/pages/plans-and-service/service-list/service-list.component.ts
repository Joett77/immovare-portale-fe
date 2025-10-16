import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, effect, inject, input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { PlusIconComponent } from '../../../../shared/atoms/icons/plus-icon/plus-icon.component';
import { SearchIconComponent } from '../../../../shared/atoms/icons/search-icon/search-icon.component';
import { PlanServiceActionsDropdownComponent } from '../plan-service-actions-dropdown/plan-service-actions-dropdown.component';

import { Plan } from '../../../../public/interface/plan.interface';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRight, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { PlanAndServiceService } from '../../../../public/services/plan-and-service.service';
import { ServiceType } from '../../../../core/enums/serviceType';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    FormsModule,
    PlusIconComponent,
    CurrencyPipe,
    RouterLink,
    DatePipe,
    FontAwesomeModule,
    SearchIconComponent,
    PlanServiceActionsDropdownComponent,
  ],
  templateUrl: './service-list.component.html',
  styleUrl: './service-list.component.scss',
})
export class ServiceListComponent implements OnInit {
  service = input<Plan[]>([]);
  private planService = inject(PlanAndServiceService);

  filteredService: Plan[] = [];

  isLoading: boolean = false;
  isService: boolean = true;

  faArrowRight = faArrowRight;
  faInfoCircle = faInfoCircle;

  // FILTER
  searchQuery: string = '';
  selectedStatus: string = '';
  selectedType: string = '';
  selectedPriceRange: string = '';

  // Filter options
  statusOptions = [
    {
      label: 'Attivo',
      value: 'active',
    },
    {
      label: 'Disattivo',
      value: 'inactive',
    }
  ];
  typeOptions = Object.entries(ServiceType);

  constructor() {
    effect(() => {
      const service = this.service();
      if (service) {
        this.filteredService = [...service];
        this.applyFilters();
      }
    });
  }

  ngOnInit(): void {}

  applyFilters() {
    const filterData = {
      title: this.searchQuery,
      status: this.selectedStatus,
      isService:
        this.selectedType === 'Gratis'
          ? true
          : this.selectedType === 'A pagamento'
            ? false
            : undefined,
      type: this.selectedType,
    };
    const filtered = Object.fromEntries(
      Object.entries(filterData).filter(([_, v]) => v !== null && v !== undefined && v !== '')
    );

    this.planService.updateFilterService(filtered);
  }
  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedPriceRange = '';
    this.selectedType = '';
    this.applyFilters();
  }

  // Dropdown actions
  editPlanService(event: any) {
    console.log('Edit plan with ID:', event);
  }
  viewPlanService(event: any) {
    console.log('Edit plan with ID:', event);
  }
  deletePlanService(event: any) {
    console.log('Edit plan with ID:', event);
  }
  duplicatePlanService(event: any) {
    console.log('Duplicate plan with ID:', event);
  }

  async reloadList() {
    await this.planService.getService();
  }
}
