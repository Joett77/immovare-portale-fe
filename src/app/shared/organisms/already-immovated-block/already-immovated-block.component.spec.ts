import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlreadyImmovatedBlockComponent } from './already-immovated-block.component';

describe('AlreadyImmovatedBlockComponent', () => {
  let component: AlreadyImmovatedBlockComponent;
  let fixture: ComponentFixture<AlreadyImmovatedBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlreadyImmovatedBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlreadyImmovatedBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
