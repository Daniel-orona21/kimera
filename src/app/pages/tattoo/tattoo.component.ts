import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-tattoo',
  imports: [],
  templateUrl: './tattoo.component.html',
  styleUrl: './tattoo.component.scss'
})
export class TattooComponent implements AfterViewInit {
  @ViewChild('svgElement') svgElement!: ElementRef<SVGElement>;

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
      fill: 'rgb(0, 0, 0)',
      duration: 0.5,
      ease: 'none'
    });
  }
}
