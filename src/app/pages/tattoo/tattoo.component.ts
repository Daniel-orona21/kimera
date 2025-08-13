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
  @ViewChild('ventana') ventana!: ElementRef<HTMLDivElement>;
  @ViewChild('seccion1') seccion1!: ElementRef<HTMLDivElement>;

  ngAfterViewInit() {
    // Registrar ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    // Configurar la animación del SVG
    this.setupSvgAnimation();
    
    // Configurar la animación de la ventana
    this.setupVentanaAnimation();
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

  private setupVentanaAnimation(): void {
    const ventana = this.ventana.nativeElement;
    const seccion1 = this.seccion1.nativeElement;
    
    if (!ventana || !seccion1) return;

    // Estado inicial: círculo pequeño
    gsap.set(ventana, {
      '--circle-size': '30dvh'
    });

    // Timeline para la animación de la ventana
    const ventanaTl = gsap.timeline({
      scrollTrigger: {
        trigger: seccion1,
        scroller: document.querySelector('.cuerpo') || window,
        start: 'top -35%',
        end: 'bottom 20%',
        markers: true,
        scrub: 1
      }
    });

    // Animación: hacer crecer el círculo para revelar la imagen
    ventanaTl.to(ventana, {
      '--circle-size': '100vw', // Círculo del tamaño de la pantalla
      duration: 1,
      ease: 'power2.out',
      onUpdate: function() {
        // Actualizar el CSS mask en tiempo real
        const circleSize = this['targets']()[0].style.getPropertyValue('--circle-size');
        const maskValue = `radial-gradient(circle ${circleSize} at center, transparent 0, transparent ${circleSize}, black ${circleSize})`;
        
        this['targets']()[0].style.setProperty('-webkit-mask', maskValue);
        this['targets']()[0].style.setProperty('mask', maskValue);
      }
    });
  }
}
