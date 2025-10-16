import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyBuyComponent } from './property-buy.component';

describe('PropertyBuyComponent', () => {
  let component: PropertyBuyComponent;
  let fixture: ComponentFixture<PropertyBuyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyBuyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyBuyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
