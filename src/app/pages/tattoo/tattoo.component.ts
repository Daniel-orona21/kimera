import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CircularGalleryComponent } from '../../shared/components/circular-gallery/circular-gallery.component';

@Component({
  selector: 'app-tattoo',
  imports: [CircularGalleryComponent],
  templateUrl: './tattoo.component.html',
  styleUrl: './tattoo.component.scss'
})
export class TattooComponent implements AfterViewInit {
  @ViewChild('svgElement') svgElement!: ElementRef<SVGElement>;

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

  ngAfterViewInit() {
    // Registrar ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    // Configurar la animación del SVG
    this.setupSvgAnimation();
  }

  private setupSvgAnimation(): void {
    const svg = this.svgElement.nativeElement;
    const path = svg.querySelector('.svg-elem-1') as SVGPathElement;
    
    if (!path) return;

    // Estado inicial: SVG invisible
    gsap.set(path, { 
      strokeDasharray: '2079.856689453125px',
      strokeDashoffset: '2079.856689453125px',
      fill: 'transparent'
    });

    // Timeline para la animación del trazo
    const strokeTl = gsap.timeline({
      scrollTrigger: {
        trigger: svg,
        scroller: document.querySelector('.cuerpo') || window,
        start: 'top 80%',
        end: 'top 50%',
        scrub: 1
      }
    });

    // Animación del trazo
    strokeTl.to(path, {
      strokeDashoffset: 0,
      duration: 1,
      ease: 'none'
    });

    // Timeline para el relleno (se activa después del trazo)
    const fillTl = gsap.timeline({
      scrollTrigger: {
        trigger: svg,
        scroller: document.querySelector('.cuerpo') || window,
        start: 'top 80%',
        end: 'top 60%',
        scrub: 1
      }
    });

    // Animación del relleno
    fillTl.to(path, {
      fill: 'rgb(255, 255, 255)',
      duration: 0.5,
      ease: 'none'
    });
  }


}
