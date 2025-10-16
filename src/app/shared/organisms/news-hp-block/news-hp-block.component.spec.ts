import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsHpBlockComponent } from './news-hp-block.component';

describe('NewsHpBlockComponent', () => {
  let component: NewsHpBlockComponent;
  let fixture: ComponentFixture<NewsHpBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsHpBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsHpBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
