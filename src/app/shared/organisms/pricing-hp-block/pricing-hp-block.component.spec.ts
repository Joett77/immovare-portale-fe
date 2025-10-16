import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingHpBlockComponent } from './pricing-hp-block.component';

describe('PricingHpBlockComponent', () => {
  let component: PricingHpBlockComponent;
  let fixture: ComponentFixture<PricingHpBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingHpBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PricingHpBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
