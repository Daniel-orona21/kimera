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

  public whatsApp(barbero: string) {
    let url = '';
  
    switch (barbero) {
      case 'yahir':
        url = 'https://wa.me/6183286528?text=Hola!'; // Número de Yahir
        break;
      case 'leo':
        url = 'https://wa.me/6182955673?text=Hola!'; // Número de Leo
        break;
      case 'erick':
        url = 'https://wa.me/6181349978?text=Hola!'; // Número de Erick
        break;
      default:
        console.warn('Barbero no encontrado');
        return;
    }
  
    window.open(url, '_blank');
  }
}
