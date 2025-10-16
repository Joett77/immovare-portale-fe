import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CityIconComponent } from './city-icon.component';

describe('CityIconComponent', () => {
  let component: CityIconComponent;
  let fixture: ComponentFixture<CityIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CityIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
