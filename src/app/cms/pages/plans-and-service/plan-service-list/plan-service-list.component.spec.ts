import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanServiceListComponent } from './plan-service-list.component';

describe('PlanServiceListComponent', () => {
  let component: PlanServiceListComponent;
  let fixture: ComponentFixture<PlanServiceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanServiceListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanServiceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
