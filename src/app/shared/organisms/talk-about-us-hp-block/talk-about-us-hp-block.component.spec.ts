import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TalkAboutUsHpBlockComponent } from './talk-about-us-hp-block.component';

describe('TalkAboutUsHpBlockComponent', () => {
  let component: TalkAboutUsHpBlockComponent;
  let fixture: ComponentFixture<TalkAboutUsHpBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalkAboutUsHpBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TalkAboutUsHpBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
