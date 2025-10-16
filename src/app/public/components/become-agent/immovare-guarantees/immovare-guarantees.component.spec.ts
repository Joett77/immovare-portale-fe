import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmovareGuaranteesComponent } from './immovare-guarantees.component';

describe('ImmovareGuaranteesComponent', () => {
  let component: ImmovareGuaranteesComponent;
  let fixture: ComponentFixture<ImmovareGuaranteesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImmovareGuaranteesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImmovareGuaranteesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
