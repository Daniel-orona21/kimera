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
      image: 'images/tattoos/t1.png',
      text: 'Puntillismo',
    },
    {
      image: 'images/tattoos/t2.png',
      text: 'Linea Fina',
    },
    {
      image: 'images/tattoos/t3.png',
      text: 'Realismo',
    },
    {
      image: 'images/tattoos/t4.png',
      text: 'Colores',
    },
    {
      image: 'images/tattoos/t5.png',
      text: 'Neumorfismo',
    },
    {
      image: 'images/tattoos/t6.png',
      text: 'Sombras',
    },
  ];

  ngAfterViewInit() {
    // Registrar ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    // Configurar la animación del SVG
    this.setupSvgAnimation();
    
    // Configurar la animación de la imagen
    this.setupImageAnimation();
  }

    private setupSvgAnimation(): void {
    console.log('🔍 Configurando animación SVG tattoo...');
    const svg = this.svgElement.nativeElement;
    const path = svg.querySelector('.svg-elem-1') as SVGPathElement;
    
    if (!path) {
      console.log('❌ No se encontró el path del SVG');
      return;
    }

    console.log('✅ SVG y path encontrados, configurando animación...');

    // Estado inicial: SVG invisible
    gsap.set(path, { 
      strokeDasharray: '2079.856689453125px',
      strokeDashoffset: '2079.856689453125px',
      fill: 'transparent'
    });

    // Buscar el scroller del componente home
    const homeScroller = document.querySelector('.cuerpo');
    console.log('🔍 Scroller encontrado:', !!homeScroller);

    // Timeline para la animación del trazo - MÁS LENTO
    const strokeTl = gsap.timeline({
      scrollTrigger: {
        trigger: svg,
        scroller: homeScroller || window,
        start: 'top 80%',
        end: 'top 30%', // MÁS LARGO PARA SER MÁS LENTO
        scrub: 1
      }
    });

    // Animación del trazo
    strokeTl.to(path, {
      strokeDashoffset: 0,
      duration: 1,
      ease: 'none'
    });

    // Timeline para el relleno - SE ACTIVA AUTOMÁTICAMENTE DESPUÉS DEL TRAZO
    const fillTl = gsap.timeline({
      scrollTrigger: {
        trigger: svg,
        scroller: homeScroller || window,
        start: 'top 70%', // EMPIEZA CUANDO TERMINA EL TRAZO
        end: 'top 30%',   // SOLO UN PUNTO PARA ACTIVAR
        toggleActions: 'play none none reverse' // SE ACTIVA UNA VEZ
      }
    });

    // Animación del relleno - 1 SEGUNDO AUTOMÁTICO
    fillTl.to(path, {
      fill: 'white',
      duration: 1, // 1 SEGUNDO COMO PEDISTE
      ease: 'power2.out' // SUAVE AL FINAL
    });

    // VERIFICAR QUE LAS ANIMACIONES ESTÁN CONFIGURADAS
    console.log('🔍 Configuración de animaciones:', {
      strokeStart: 'top 80%',
      strokeEnd: 'top 30%', // MÁS LENTO
      fillStart: 'top 30%', // AUTOMÁTICO DESPUÉS DEL TRAZO
      fillEnd: 'top 30%',   // SOLO ACTIVACIÓN
      scroller: homeScroller ? 'homeScroller' : 'window',
      fillDuration: '1 segundo automático'
    });

    console.log('🚀 Animaciones SVG configuradas exitosamente');
  }

  private setupImageAnimation(): void {
    console.log('🖼️ Configurando animación de imagen tattoo...');
    
    // Pequeño delay para asegurar que el componente esté renderizado
    setTimeout(() => {
      const tattooImage = document.querySelector('.contenedorImg img');
      
      if (!tattooImage) {
        console.log('❌ No se encontró la imagen del tattoo');
        return;
      }

      console.log('✅ Imagen encontrada, configurando animación...');
      
      // Buscar el scroller del componente home
      const homeScroller = document.querySelector('.cuerpo');
      console.log('🔍 Scroller para imagen encontrado:', !!homeScroller);
      
      // Animación de la imagen basada en scroll - movimiento sutil
      gsap.to(tattooImage, {
        y: window.innerWidth <= 768 ? -40 : -150, // En móvil -50, en desktop -150
        ease: 'none',
        scrollTrigger: {
          trigger: tattooImage,
          scroller: homeScroller || window,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1 // Sincroniza con el scroll
        }
      });

      console.log('🚀 Animación de imagen configurada exitosamente');
    }, 150); // Delay ligeramente mayor para asegurar renderizado completo
  }

}
