import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmovatoriComponent } from './immovatori.component';

describe('ImmovatoriComponent', () => {
  let component: ImmovatoriComponent;
  let fixture: ComponentFixture<ImmovatoriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImmovatoriComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImmovatoriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
