import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitySelectionCardComponent } from './city-selection-card.component';

describe('CitySelectionCardComponent', () => {
  let component: CitySelectionCardComponent;
  let fixture: ComponentFixture<CitySelectionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitySelectionCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitySelectionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
