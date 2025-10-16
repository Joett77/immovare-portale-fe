import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlansAndServiceComponent } from './plans-and-service.component';

describe('PlansAndServiceComponent', () => {
  let component: PlansAndServiceComponent;
  let fixture: ComponentFixture<PlansAndServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlansAndServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlansAndServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
