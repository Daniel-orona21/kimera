import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeartViewerComponent } from '../../shared/components/heart-viewer/heart-viewer.component';
import * as THREE from 'three';

@Component({
  selector: 'app-model-section',
  standalone: true,
  imports: [CommonModule, HeartViewerComponent],
  templateUrl: './model-section.component.html',
  styleUrls: ['./model-section.component.scss']
})
export class ModelSectionComponent {
  @Input() scrollY: number = 0;
  @Input() scrollDirection: number = 1;
  @Output() modelReady = new EventEmitter<THREE.Group>();

  onModelReady(model: THREE.Group) {
    this.modelReady.emit(model);
  }
}
