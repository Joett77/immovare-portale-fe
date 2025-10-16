import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesMapDetailsComponent } from './properties-map-details.component';

describe('PropertiesMapDetailsComponent', () => {
  let component: PropertiesMapDetailsComponent;
  let fixture: ComponentFixture<PropertiesMapDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertiesMapDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertiesMapDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
