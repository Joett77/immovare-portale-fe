import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPropertiesAdsComponent } from './dashboard-properties-ads.component';

describe('DashboardPropertiesAdsComponent', () => {
  let component: DashboardPropertiesAdsComponent;
  let fixture: ComponentFixture<DashboardPropertiesAdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPropertiesAdsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardPropertiesAdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
