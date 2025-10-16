import { Component, OnInit } from '@angular/core';
import {
  GENERAL_CONDITIONS_FOR_FOR_REAL_ESTATE_BROKERAGE_SERVICES,
  GENERAL_CONDITIONS_FOR_SUBSCRIPTION_SERVICES,
} from './data/terms-and-condition.component-data';

@Component({
  selector: 'app-terms-and-condition',
  standalone: true,
  imports: [],
  templateUrl: './terms-and-condition.component.html',
  styleUrl: './terms-and-condition.component.scss',
})
export class TermsAndConditionComponent implements OnInit {
  GENERAL_CONDITIONS_FOR_SUBSCRIPTION_SERVICES: any[] = [];
  GENERAL_CONDITIONS_FOR_FOR_REAL_ESTATE_BROKERAGE_SERVICES: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.GENERAL_CONDITIONS_FOR_SUBSCRIPTION_SERVICES =
      GENERAL_CONDITIONS_FOR_SUBSCRIPTION_SERVICES;

    this.GENERAL_CONDITIONS_FOR_FOR_REAL_ESTATE_BROKERAGE_SERVICES =
      GENERAL_CONDITIONS_FOR_FOR_REAL_ESTATE_BROKERAGE_SERVICES;
  }

  toggleAccordion(index: number, type: 'subscription' | 'brokerage') {
    if (type === 'subscription') {
      this.GENERAL_CONDITIONS_FOR_SUBSCRIPTION_SERVICES[index].open =
        !this.GENERAL_CONDITIONS_FOR_SUBSCRIPTION_SERVICES[index].open;
    } else if (type === 'brokerage') {
      this.GENERAL_CONDITIONS_FOR_FOR_REAL_ESTATE_BROKERAGE_SERVICES[index].open =
        !this.GENERAL_CONDITIONS_FOR_FOR_REAL_ESTATE_BROKERAGE_SERVICES[index].open;
    }
  }
}
