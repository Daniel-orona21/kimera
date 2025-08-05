import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeartViewerComponent } from '../heart-viewer/heart-viewer.component';
import * as THREE from 'three';
import { CarouselComponent } from "../carousel/carousel.component";

@Component({
  selector: 'app-model-section',
  standalone: true,
  imports: [CommonModule, HeartViewerComponent, CarouselComponent, CarouselComponent ],
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
