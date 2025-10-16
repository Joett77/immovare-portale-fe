import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageRightBlockComponent } from './image-right-block.component';

describe('ImageRightBlockComponent', () => {
  let component: ImageRightBlockComponent;
  let fixture: ComponentFixture<ImageRightBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageRightBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageRightBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
