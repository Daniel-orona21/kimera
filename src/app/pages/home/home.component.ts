import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, Renderer2, HostBinding, Inject } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BarberComponent } from "../barber/barber.component";
import { TattooComponent } from "../tattoo/tattoo.component";
import { UbicacionComponent } from "../ubicacion/ubicacion.component";
import { ImagesComponent } from "../images/images.component";
import { ModelSectionComponent } from '../productos/model-section/model-section.component';
import * as THREE from 'three';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, BarberComponent, TattooComponent, UbicacionComponent, ImagesComponent, ModelSectionComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  animationState: 'idle' | 'loading' | 'loaded' = 'idle';
  playAnimation = false;
  currentScroll: number = 0;
  scrollDirection: number = 1; // 1 for down, -1 for up
  private previousScroll: number = 0;

  @HostBinding('class.no-animation')
  get noAnimation(): boolean {
    return !this.playAnimation;
  }

  private lenis: Lenis | null = null;
  private rafHandle: number | null = null;
  private scrollAnimationFrame: number | null = null;
  private themeColorAnimation: number | null = null;

  @ViewChild('cuerpo') cuerpo!: ElementRef<HTMLDivElement>;
  @ViewChild('header') header!: ElementRef<HTMLElement>;
  @ViewChild('inicio') inicio!: ElementRef<HTMLElement>;
  @ViewChild('h1') h1!: ElementRef<HTMLElement>;
  @ViewChild('h1Placeholder') h1Placeholder!: ElementRef<HTMLElement>;
  @ViewChild('h1Wrapper') h1Wrapper!: ElementRef<HTMLElement>;
  @ViewChild('subtitulo') subtitulo!: ElementRef<HTMLElement>;
  @ViewChild('scrollDownContainer') scrollDownContainer!: ElementRef<HTMLElement>;
  @ViewChild(ModelSectionComponent, { read: ElementRef }) modelSection!: ElementRef;
  @ViewChild('carousel', { read: ElementRef }) carousel!: ElementRef;

  private model?: THREE.Group;

  private h1InitialRect?: DOMRect;
  private h1TargetRect?: DOMRect;

  private initialTimer: any;
  private loadingTimer: any;

  constructor(private renderer: Renderer2, @Inject(DOCUMENT) private document: Document) {}

  ngOnInit() {
    this.updateThemeColor('#19322c');  // Solo este verde inicial se mantiene
    // Registrar ScrollTrigger una sola vez
    gsap.registerPlugin(ScrollTrigger);
    
    if (this.playAnimation) {
      this.initialTimer = setTimeout(() => {
        this.animationState = 'loading';

        this.loadingTimer = setTimeout(() => {
          this.animationState = 'loaded';
          this.onAnimationEnd();
        }, 5000);
      }, 0);
    } else {
      this.animationState = 'loaded';
    }
  }

  ngOnDestroy() {
    clearTimeout(this.initialTimer);
    clearTimeout(this.loadingTimer);
    
    if (this.scrollAnimationFrame) {
      cancelAnimationFrame(this.scrollAnimationFrame);
    }
    
    if (this.rafHandle) {
      cancelAnimationFrame(this.rafHandle);
    }

    if (this.themeColorAnimation) {
      cancelAnimationFrame(this.themeColorAnimation);
    }
    
    // Limpiar ScrollTrigger
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    
    this.lenis?.destroy();
    const currentThemeColor = this.document.querySelector('meta[name="theme-color"]')?.getAttribute('content') || '#000000';
    this.transitionThemeColor(currentThemeColor, '#FFFFFF', 500);
  }

  ngAfterViewInit() {
    this.initializeLenis();
    this.renderer.setStyle(this.inicio.nativeElement, 'background-color', '#19322c');

    if (!this.playAnimation) {
      this.transitionThemeColor('#19322c', '#000000', 500);
      this.renderer.setStyle(this.inicio.nativeElement, 'background-color', 'black');
      this.renderer.addClass(this.subtitulo.nativeElement, 'visible');
      this.renderer.addClass(this.scrollDownContainer.nativeElement, 'visible');
      
      document.fonts.ready.then(() => {
        this.setupScroll();
        this.setupModelSectionTrigger();
      });
    }
  }

  private initializeLenis() {
    this.lenis = new Lenis({
      wrapper: this.cuerpo.nativeElement,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      infinite: false
    });
    
    this.lenis.stop();

    const raf = (time: number) => {
      this.lenis?.raf(time);
      this.rafHandle = requestAnimationFrame(raf);
    };
    this.rafHandle = requestAnimationFrame(raf);

    this.lenis.on('scroll', (e: { scroll: number }) => {
      // Detect scroll direction
      if (e.scroll > this.previousScroll) {
        this.scrollDirection = 1;
      } else if (e.scroll < this.previousScroll) {
        this.scrollDirection = -1;
      }
      this.previousScroll = e.scroll;

      this.currentScroll = e.scroll;
      ScrollTrigger.update();
    });
  }

  private setupScrollTriggerProxy() {
    // Configurar ScrollTrigger para trabajar perfectamente con Lenis
    ScrollTrigger.scrollerProxy(this.cuerpo.nativeElement, {
      scrollTop: (value?: number) => {
        if (value !== undefined) {
          this.lenis?.scrollTo(value, { immediate: true });
          return;
        }
        return this.lenis?.scroll || 0;
      },
      getBoundingClientRect: () => {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight
        };
      },
      pinType: this.cuerpo.nativeElement.style.transform ? "transform" : "fixed"
    });

    // Ya no es necesario, se maneja arriba
    // this.lenis?.on('scroll', ScrollTrigger.update);
    
    // Refrescar ScrollTrigger después de configuración
    ScrollTrigger.addEventListener("refresh", () => this.lenis?.resize());
  }

  private setupGsapAnimation(): void {
    this.h1InitialRect = this.h1.nativeElement.getBoundingClientRect();
    this.h1TargetRect = this.h1Placeholder.nativeElement.getBoundingClientRect();

    if (!this.h1InitialRect || !this.h1TargetRect) {
      return;
    }

    this.renderer.setStyle(this.h1Wrapper.nativeElement, 'height', `${this.h1InitialRect.height}px`);
    this.renderer.addClass(this.h1.nativeElement, 'moving');
    this.renderer.setStyle(this.h1.nativeElement, 'top', `${this.h1InitialRect.top}px`);
    this.renderer.setStyle(this.h1.nativeElement, 'left', `${this.h1InitialRect.left}px`);

    const targetScale = this.h1TargetRect.width / this.h1InitialRect.width;
    const initialCenterX = this.h1InitialRect.left + this.h1InitialRect.width / 2;
    const initialCenterY = this.h1InitialRect.top + this.h1InitialRect.height / 2;
    const targetCenterX = this.h1TargetRect.left + this.h1TargetRect.width / 2;
    const targetCenterY = this.h1TargetRect.top + this.h1TargetRect.height / 2;
    const deltaX = targetCenterX - initialCenterX;
    const deltaY = targetCenterY - initialCenterY;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: this.inicio.nativeElement,
        scroller: this.cuerpo.nativeElement,
        start: 'top top',
        end: '50% top',
        scrub: 0.5,
      },
    });

    tl.fromTo(this.h1.nativeElement, {
      x: 0,
      y: 0,
      scale: 1,
      webkitTextFillColor: 'white',
      filter: 'drop-shadow(0.05em 0.025em 0.04em rgba(0, 0, 0, 0.8))',
    }, {
      x: deltaX,
      y: deltaY,
      scale: targetScale,
      webkitTextFillColor: 'black',
      filter: 'drop-shadow(0 0 0 rgba(0, 0, 0, 0))',
      ease: 'none',
      onStart: () => {
        this.renderer.setStyle(this.h1.nativeElement, 'transform-origin', 'center center');
      }
    })
    .fromTo(this.header.nativeElement, {
      scale: 1.5,
      ease: 'none'
    }, {
      scale: 1,
      ease: 'none'
    }, '<')
    .to(this.header.nativeElement, { opacity: 1 }, '<')
    .to(this.subtitulo.nativeElement, { opacity: 0 }, '<')
    .to(this.scrollDownContainer.nativeElement, { opacity: 0 }, '<');

    ScrollTrigger.create({
      trigger: this.header.nativeElement,
      scroller: this.cuerpo.nativeElement,
      start: 'bottom top',
      onEnter: () => this.transitionThemeColor('#000000', '#FFFFFF', 300),
      onLeaveBack: () => this.transitionThemeColor('#FFFFFF', '#000000', 300)
    });
  }

  onAnimationEnd() {
    const subtituloEl = this.subtitulo.nativeElement;
    const scroll = this.scrollDownContainer.nativeElement;

    setTimeout(() => {
      this.transitionThemeColor('#19322c', '#000000', 1000);
      subtituloEl.classList.add('visible');
      setTimeout(() => {
        this.setupScroll();
        scroll.classList.add('visible')
      }, 500);
    }, 2000);
  }

  scrollTo(section: string) {
    this.lenis?.scrollTo(section, {
      offset: 0,
      duration: 1.5,
    });
  }

  onModelReady(model: THREE.Group) {
    this.model = model;
    this.setupModelSectionTrigger();
  }

  private setupModelSectionTrigger(): void {
    if (!this.model) return; // No hacer nada si el modelo no está listo

    // 1. Timeline para el cambio de color
    const colorTl = gsap.timeline({
      scrollTrigger: {
        trigger: this.modelSection.nativeElement,
        scroller: this.cuerpo.nativeElement,
        start: 'top 80%',
        end: 'bottom 50%',  // Ahora sí: se revierte cuando el FINAL de la sección sale por arriba
        toggleActions: 'play reverse play reverse'
      }
    });

    colorTl.to('.cuerpo', { backgroundColor: '#000000', duration: 0.3 })
      .to(this.header.nativeElement, { backgroundColor: '#2929296e', duration: 0.3 }, '<')
      .to(this.header.nativeElement.querySelectorAll('a'), { color: '#ffffff', duration: 0.3 }, '<')
      .to(this.header.nativeElement, { '--before-bg-color': '#ffffff' }, '<')
      .to(this.h1.nativeElement, { color: '#FFFFFF', webkitTextFillColor: '#FFFFFF', duration: 0.3 }, '<');

    // 2. Timeline para el cambio de color del tema
    const themeColorTl = gsap.timeline({
      scrollTrigger: {
        trigger: this.modelSection.nativeElement,
        scroller: this.cuerpo.nativeElement,
        start: 'top 80%',
        end: 'bottom 50%',
        toggleActions: 'play reverse play reverse',
        onEnter: () => {
          // Cambiar a negro suavemente al entrar
          this.transitionThemeColor('#FFFFFF', '#000000', 300);
        },
        onLeave: () => {
          // Cambiar de vuelta a blanco suavemente al salir
          setTimeout(() => {
            this.transitionThemeColor('#000000', '#FFFFFF', 300);
          }, 200);
        },
        onEnterBack: () => {
          // Cambiar a negro suavemente al volver a entrar
          this.transitionThemeColor('#FFFFFF', '#000000', 300);
        },
        onLeaveBack: () => {
          // Cambiar de vuelta a blanco suavemente al salir hacia arriba
          setTimeout(() => {
            this.transitionThemeColor('#000000', '#FFFFFF', 300);
          }, 200);
        }
      }
    });

    // 3. Animación para mostrar el carousel cuando se llega al contenido1
    const carouselElement = this.modelSection.nativeElement.querySelector('.contenido1 .sombra');
    if (carouselElement) {
      // Inicialmente oculto
      gsap.set(carouselElement, { opacity: 0, y: 0, visibility: 'hidden' });
      
      const carouselTl = gsap.timeline({
        scrollTrigger: {
          trigger: this.modelSection.nativeElement.querySelector('.contenido1'),
          scroller: this.cuerpo.nativeElement,
          start: 'top top',
          end: 'bottom bottom',
          toggleActions: 'play reverse play reverse'
        }
      });

      carouselTl.to(carouselElement, { 
        opacity: 1, 
        y: 0, 
        visibility: 'visible',
      });
    }

    // 4. Animación para mostrar el centro2 cuando se llega al contenido2
    const centro2Element = this.modelSection.nativeElement.querySelector('.contenido2 .centro2');
    if (centro2Element) {
      // Inicialmente oculto
      gsap.set(centro2Element, { opacity: 0, y: 0, visibility: 'hidden' });
      
      const centro2Tl = gsap.timeline({
        scrollTrigger: {
          trigger: this.modelSection.nativeElement.querySelector('.contenido2'),
          scroller: this.cuerpo.nativeElement,
          start: 'top top',
          end: 'bottom bottom',
          toggleActions: 'play reverse play reverse'
        }
      });

      centro2Tl.to(centro2Element, { 
        opacity: 1, 
        y: 0, 
        visibility: 'visible',
      });
    }

    // 5. La animación de escala se mantiene igual
    this.model.scale.set(1, 1, 1);
    const scaleTl = gsap.timeline({
      scrollTrigger: {
        trigger: this.modelSection.nativeElement,
        scroller: this.cuerpo.nativeElement,
        start: 'top 0%',    // Empieza cuando el final de la sección está cerca
        end: 'bottom 200%',      // Termina justo cuando la sección sale por arriba
        scrub: 0.5,
      }
    });

    scaleTl
      .to(this.model.scale, { x: 5, y: 5, z: 5 })
      .to(this.model.scale, { x: 5, y: 5, z: 5 })
      .to(this.model.scale, { x: 1, y: 1, z: 1 });

    // 6. Animación para el componente barber
    this.setupBarberAnimations();
  }

  private setupBarberAnimations(): void {
    // Buscar el componente barber en el DOM
    const barberComponent = document.querySelector('app-barber');
    if (!barberComponent) return;

    // Buscar los contenedores dentro del componente barber
    const contenedores = barberComponent.querySelectorAll('.contenedor');
    
    contenedores.forEach((contenedor, index) => {
      // Detectar si es móvil para ajustar la animación
      const isMobile = window.innerWidth <= 768;
      const yOffset = isMobile ? 20 : 100; // Menos traslado en móvil
      const imageYOffset = isMobile ? 20 : 50; // Menos traslado en móvil para imágenes

      // Inicialmente ocultos con fade in desde abajo
      gsap.set(contenedor, { 
        opacity: 0, 
        y: yOffset, // Usar el offset ajustado según dispositivo
        scale: 0.9
      });
      
      const barberTl = gsap.timeline({
        scrollTrigger: {
          trigger: contenedor,
          scroller: this.cuerpo.nativeElement,
          start: 'top bottom',
          end: 'bottom 0%',
          toggleActions: 'play reverse play reverse'
        }
      });

      barberTl.to(contenedor, { 
        opacity: 1, 
        y: 0,
        scale: 1,
        duration: 1,
        ease: 'power2.out'
      });

      // Animación unificada para las imágenes dentro de cada contenedor
      const imagen = contenedor.querySelector('.imagen img');
      if (imagen) {
        gsap.set(imagen, { 
          scale: 1.2,
          filter: 'blur(2px)',
          y: imageYOffset // Posición inicial ajustada según dispositivo
        });
        
        // Animación rápida para el blur (se activa al inicio)
        const blurTl = gsap.timeline({
          scrollTrigger: {
            trigger: contenedor,
            scroller: this.cuerpo.nativeElement,
            start: 'top 90%',
            end: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        });

        blurTl.to(imagen, { 
          filter: 'blur(0px)',
          duration: 0.5,
          ease: 'power2.out'
        });
        
        // Animación principal para scale y parallax
        const imageTl = gsap.timeline({
          scrollTrigger: {
            trigger: contenedor,
            scroller: this.cuerpo.nativeElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1, // Hace que la animación siga el scroll
          }
        });

        imageTl.to(imagen, { 
          scale: 1,
          y: isMobile ? -20 : -50, // Menos parallax en móvil
          ease: 'power2.out'
        });
      }

      // Animación para el texto (h1) dentro de cada contenedor
      const texto = contenedor.querySelector('h1');
      if (texto) {
        gsap.set(texto, { 
          opacity: 0, 
          x: index % 2 === 0 ? -50 : 50 // Alternar dirección según el índice
        });
        
        const textTl = gsap.timeline({
          scrollTrigger: {
            trigger: contenedor,
            scroller: this.cuerpo.nativeElement,
            start: 'top 75%',
            end: 'bottom 25%',
            toggleActions: 'play reverse play reverse'
          }
        });

        textTl.to(texto, { 
          opacity: 1, 
          x: 0,
          duration: 0.8,
          ease: 'power2.out'
        });
      }
    });
  }

  private setupScroll(): void {
    this.renderer.addClass(this.cuerpo.nativeElement, 'scroll');
    this.setupScrollTriggerProxy();
    // Ya no llamamos a setupModelSectionTrigger() aquí
    this.lenis?.start();
    this.setupGsapAnimation();
  }

  private updateThemeColor(color: string): void {
    const themeColorMeta = this.document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      this.renderer.setAttribute(themeColorMeta, 'content', color);
    }
  }

  private transitionThemeColor(startColor: string, endColor: string, duration: number): void {
    if (this.themeColorAnimation) {
      cancelAnimationFrame(this.themeColorAnimation);
    }

    const startRGB = this.hexToRgb(startColor);
    const endRGB = this.hexToRgb(endColor);

    if (!startRGB || !endRGB) {
      this.updateThemeColor(endColor);
      return;
    }

    let startTime: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      const currentRGB = {
        r: Math.round(startRGB.r + (endRGB.r - startRGB.r) * progress),
        g: Math.round(startRGB.g + (endRGB.g - startRGB.g) * progress),
        b: Math.round(startRGB.b + (endRGB.b - startRGB.b) * progress)
      };

      this.updateThemeColor(this.rgbToHex(currentRGB.r, currentRGB.g, currentRGB.b));

      if (progress < 1) {
        this.themeColorAnimation = requestAnimationFrame(animate);
      } else {
        this.themeColorAnimation = null;
      }
    };

    this.themeColorAnimation = requestAnimationFrame(animate);
  }

  private hexToRgb(hex: string): { r: number, g: number, b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0');
  }
}
