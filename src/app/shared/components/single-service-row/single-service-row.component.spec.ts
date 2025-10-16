import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleServiceRowComponent } from './single-service-row.component';

describe('SingleServiceRowComponent', () => {
  let component: SingleServiceRowComponent;
  let fixture: ComponentFixture<SingleServiceRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleServiceRowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleServiceRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
