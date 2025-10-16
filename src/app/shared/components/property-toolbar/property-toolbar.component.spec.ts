import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyToolbarComponent } from './property-toolbar.component';

describe('PropertyToolbarComponent', () => {
  let component: PropertyToolbarComponent;
  let fixture: ComponentFixture<PropertyToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
