import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardViewMessageComponent } from './dashboard-view-message.component';

describe('DashboardViewMessageComponent', () => {
  let component: DashboardViewMessageComponent;
  let fixture: ComponentFixture<DashboardViewMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardViewMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardViewMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
