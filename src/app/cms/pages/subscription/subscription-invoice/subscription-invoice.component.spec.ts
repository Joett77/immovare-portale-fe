import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionInvoiceComponent } from './subscription-invoice.component';

describe('SubscriptionInvoiceComponent', () => {
  let component: SubscriptionInvoiceComponent;
  let fixture: ComponentFixture<SubscriptionInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionInvoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
