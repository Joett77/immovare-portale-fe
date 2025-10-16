import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFullScreenComponent } from './modal-full-screen.component';

describe('ModalFullScreenComponent', () => {
  let component: ModalFullScreenComponent;
  let fixture: ComponentFixture<ModalFullScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFullScreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalFullScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
