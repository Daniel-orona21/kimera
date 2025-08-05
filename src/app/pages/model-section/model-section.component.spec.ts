import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelSectionComponent } from './model-section.component';

describe('ModelSectionComponent', () => {
  let component: ModelSectionComponent;
  let fixture: ComponentFixture<ModelSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
