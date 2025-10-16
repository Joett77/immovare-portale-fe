import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestInfoComponent } from './request-info.component';

describe('RequestInfoComponent', () => {
  let component: RequestInfoComponent;
  let fixture: ComponentFixture<RequestInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
