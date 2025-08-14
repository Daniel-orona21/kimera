import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollReverseComponent } from './scroll-reverse.component';

describe('ScrollReverseComponent', () => {
  let component: ScrollReverseComponent;
  let fixture: ComponentFixture<ScrollReverseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollReverseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScrollReverseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
