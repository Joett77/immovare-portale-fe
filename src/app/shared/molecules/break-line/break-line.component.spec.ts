import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreakLineComponent } from './break-line.component';

describe('BreakLineComponent', () => {
  let component: BreakLineComponent;
  let fixture: ComponentFixture<BreakLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreakLineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BreakLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
