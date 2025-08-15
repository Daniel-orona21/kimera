import { Component } from '@angular/core';
import { CircularGalleryComponent } from '../../shared/components/circular-gallery/circular-gallery.component';

@Component({
  selector: 'app-tattoo',
  imports: [CircularGalleryComponent],
  templateUrl: './tattoo.component.html',
  styleUrl: './tattoo.component.scss'
})
export class TattooComponent {

  // Datos para la galería circular
  galleryItems = [
    {
      image: 'https://picsum.photos/seed/1/800/600?grayscale',
      text: 'Tattoo 1',
    },
    {
      image: 'https://picsum.photos/seed/2/800/600?grayscale',
      text: 'Tattoo 2',
    },
    {
      image: 'https://picsum.photos/seed/3/800/600?grayscale',
      text: 'Tattoo 3',
    },
    {
      image: 'https://picsum.photos/seed/4/800/600?grayscale',
      text: 'Tattoo 4',
    },
    {
      image: 'https://picsum.photos/seed/5/800/600?grayscale',
      text: 'Tattoo 5',
    },
    {
      image: 'https://picsum.photos/seed/6/800/600?grayscale',
      text: 'Tattoo 6',
    },
  ];

}
