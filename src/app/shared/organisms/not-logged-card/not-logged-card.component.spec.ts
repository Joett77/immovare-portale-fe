import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotLoggedCardComponent } from './not-logged-card.component';

describe('NotLoggedCardComponent', () => {
  let component: NotLoggedCardComponent;
  let fixture: ComponentFixture<NotLoggedCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotLoggedCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotLoggedCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
