import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionActionsDropdownComponent } from './subscription-actions-dropdown.component';

describe('SubscriptionActionsDropdownComponent', () => {
  let component: SubscriptionActionsDropdownComponent;
  let fixture: ComponentFixture<SubscriptionActionsDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionActionsDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionActionsDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
