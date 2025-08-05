import { Component } from '@angular/core';
import { HeartViewerComponent } from '../productos/heart-viewer/heart-viewer.component';

@Component({
  selector: 'app-barber',
  standalone: true,
  imports: [HeartViewerComponent],
  templateUrl: './barber.component.html',
  styleUrl: './barber.component.scss'
})
export class BarberComponent {

}
