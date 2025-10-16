import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAddMessageComponent } from './dashboard-add-message.component';

describe('DashboardAddMessageComponent', () => {
  let component: DashboardAddMessageComponent;
  let fixture: ComponentFixture<DashboardAddMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAddMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardAddMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
