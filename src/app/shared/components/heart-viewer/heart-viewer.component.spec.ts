import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeartViewerComponent } from './heart-viewer.component';

describe('HeartViewerComponent', () => {
  let component: HeartViewerComponent;
  let fixture: ComponentFixture<HeartViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeartViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeartViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
