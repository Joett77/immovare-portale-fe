import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanServiceDetailsComponent } from './plan-service-details.component';

describe('PlanServiceDetailsComponent', () => {
  let component: PlanServiceDetailsComponent;
  let fixture: ComponentFixture<PlanServiceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanServiceDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanServiceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
