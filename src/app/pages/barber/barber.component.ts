import { Component } from '@angular/core';
import { TextRevealSimpleComponent } from '../../shared/components/text-reveal/text-reveal-simple.component';

@Component({
  selector: 'app-barber',
  standalone: true,
  imports: [TextRevealSimpleComponent],
  templateUrl: './barber.component.html',
  styleUrl: './barber.component.scss'
})
export class BarberComponent {
}
