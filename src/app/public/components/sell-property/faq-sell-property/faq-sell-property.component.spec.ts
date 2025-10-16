import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqSellPropertyComponent } from './faq-sell-property.component';

describe('FaqSellPropertyComponent', () => {
  let component: FaqSellPropertyComponent;
  let fixture: ComponentFixture<FaqSellPropertyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqSellPropertyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqSellPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
