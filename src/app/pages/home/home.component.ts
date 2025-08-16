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
import { ScrollReverseComponent } from "../scroll-reverse/scroll-reverse.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, BarberComponent, TattooComponent, UbicacionComponent, ImagesComponent, ModelSectionComponent, ScrollReverseComponent, FooterComponent],
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
    // Registrar ScrollTrigger de forma controlada
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

    if (this.playAnimation) {
      // MODO ANIMACIÓN INICIAL - EL SCROLL SE CONFIGURA DESPUÉS DE LA ANIMACIÓN
      console.log('🎬 MODO ANIMACIÓN INICIAL ACTIVADO');
      // NO configuramos scroll aquí, se hará en onAnimationEnd()
    } else {
      // MODO SIN ANIMACIÓN INICIAL - CONFIGURAR SCROLL INMEDIATAMENTE
      console.log('⚡ MODO SIN ANIMACIÓN - CONFIGURANDO SCROLL INMEDIATAMENTE');
      setTimeout(() => {
        this.setupScroll();
        this.setupModelSectionTrigger();
        console.log('🚀 ANIMACIONES CONFIGURADAS INMEDIATAMENTE');
      }, 50);
      
      this.transitionThemeColor('#19322c', '#000000', 500);
      this.renderer.setStyle(this.inicio.nativeElement, 'background-color', 'black');
      this.renderer.addClass(this.subtitulo.nativeElement, 'visible');
      this.renderer.addClass(this.scrollDownContainer.nativeElement, 'visible');
    }
  }

  private initializeLenis() {
    // CONFIGURACIÓN ORIGINAL DE LENIS - SIN MODIFICAR
    this.lenis = new Lenis({
      wrapper: this.cuerpo.nativeElement,
      duration: 0.8,
      easing: (t) => t,
      smoothWheel: false,
      infinite: false,
      lerp: 0.1
    });
    
    if (this.playAnimation) {
      // MANTENER LENIS PAUSADO DURANTE LA ANIMACIÓN INICIAL
      this.lenis.stop();
      console.log('🔧 LENIS INICIALIZADO - PAUSADO PARA ANIMACIÓN INICIAL');
    } else {
      // INICIAR LENIS INMEDIATAMENTE
      this.lenis.start();
      console.log('🔧 LENIS INICIALIZADO Y INICIADO INMEDIATAMENTE');
    }

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
    // CONFIGURACIÓN SIMPLIFICADA - COMO CUANDO playAnimation = false
    ScrollTrigger.scrollerProxy(this.cuerpo.nativeElement, {
      scrollTop: (value?: number) => {
        if (value !== undefined) {
          this.lenis?.scrollTo(value, { immediate: true });
          return;
        }
        return this.lenis?.scroll || 0;
      },
      getBoundingClientRect: () => this.cuerpo.nativeElement.getBoundingClientRect(),
      pinType: this.cuerpo.nativeElement.style.transform ? "transform" : "fixed"
    });

    // Configuración adicional para asegurar que funcione
    this.lenis?.on('scroll', ScrollTrigger.update);
    
    console.log('✅ ScrollTrigger Proxy configurado de forma simplificada');
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
        // CONFIGURAR SCROLL COMPLETO AL FINAL DE LA ANIMACIÓN
        this.setupScroll();
        this.setupModelSectionTrigger();
        scroll.classList.add('visible');
        this.animationState = 'loaded';
        
        // ASEGURAR QUE LENIS ESTÁ ACTIVO Y FUNCIONANDO
        if (this.lenis) {
          this.lenis.start();
          console.log('🔓 LENIS ACTIVADO AL FINAL DE ANIMACIÓN');
        }
        
        // VERIFICAR QUE TODO ESTÁ CONFIGURADO
        console.log('🔍 VERIFICACIÓN FINAL:', {
          lenisActive: !this.lenis?.isLocked,
          scrollClass: this.cuerpo.nativeElement.classList.contains('scroll'),
          animationState: this.animationState
        });
        
        console.log('✅ SCROLL COMPLETAMENTE HABILITADO - ANIMACIÓN TERMINADA - LINKS FUNCIONAN');
      }, 500);
    }, 2000);
  }

  scrollTo(section: string) {
    console.log(`🔗 Navegación solicitada a: ${section}, animationState: ${this.animationState}`);
    
    // VERIFICACIÓN SIMPLE DEL ESTADO
    if (!this.lenis) {
      console.log('❌ ERROR: LENIS NO DISPONIBLE');
      return;
    }
    
    // ASEGURAR QUE LENIS ESTÁ ACTIVO SIEMPRE
    if (this.lenis.isLocked) {
      this.lenis.start();
      console.log('🔓 LENIS ACTIVADO');
    }
    
    // ASEGURAR QUE EL SCROLL ESTÁ CONFIGURADO SIEMPRE
    if (!this.cuerpo.nativeElement.classList.contains('scroll')) {
      this.renderer.addClass(this.cuerpo.nativeElement, 'scroll');
      this.setupScrollTriggerProxy();
      console.log('⚡ SCROLL CONFIGURADO PARA NAVEGACIÓN');
    }
    
    // NAVEGACIÓN DIRECTA - SIEMPRE FUNCIONA
    try {
      this.lenis.scrollTo(section, {
        offset: 0,
        duration: 1.5,
      });
      console.log(`✅ NAVEGANDO A: ${section}`);
    } catch (error) {
      console.log('❌ ERROR EN NAVEGACIÓN:', error);
      // Fallback: scroll nativo
      const element = document.querySelector(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        console.log(`✅ NAVEGANDO A: ${section} CON SCROLL NATIVO`);
      }
    }
  }

  onModelReady(model: THREE.Group) {
    this.model = model;
    this.setupModelSectionTrigger();
  }

  private setupModelSectionTrigger(): void {
    if (!this.model) return; // No hacer nada si el modelo no está listo

    // Buscar la sección de tattoo en el DOM
    const tattooSection = document.querySelector('#tattoo');
    if (!tattooSection) return;

    // Timeline unificado para el cambio de color y tema
    const modelSectionTl = gsap.timeline({
      scrollTrigger: {
        trigger: tattooSection,
        scroller: this.cuerpo.nativeElement,
        start: 'top 90%',
        end: () => `70%+=${this.modelSection.nativeElement.offsetHeight}`, // Dura hasta el final de la sección de model
        onEnter: () => {
          // Cambiar a negro suavemente al entrar a la sección de tattoo
          this.transitionThemeColor('#FFFFFF', '#000000', 300);
          // Emitir cambio de tema para otros componentes
          this.emitThemeChange(true);
          // Cambiar color de fondo del cuerpo
          gsap.to('.cuerpo', { backgroundColor: '#000000', duration: 0.3 });
          // Cambiar colores del header
          gsap.to(this.header.nativeElement, { backgroundColor: '#2929296e', duration: 0.3 });
          gsap.to(this.header.nativeElement.querySelectorAll('a'), { color: '#ffffff', duration: 0.3 });
          gsap.to(this.header.nativeElement, { '--before-bg-color': '#ffffff' });
          gsap.to(this.h1.nativeElement, { color: '#FFFFFF', webkitTextFillColor: '#FFFFFF', duration: 0.3 });
        },
        onLeave: () => {
          // Cambiar de vuelta a blanco suavemente al salir completamente de la sección de model
          this.transitionThemeColor('#000000', '#FFFFFF', 300);
          // Emitir cambio de tema para otros componentes
          this.emitThemeChange(false);
          // Restaurar color de fondo del cuerpo
          gsap.to('.cuerpo', { backgroundColor: '#FFFFFF', duration: 0.3 });
          // Restaurar colores del header
          gsap.to(this.header.nativeElement, { backgroundColor: '#ffffff', duration: 0.3 });
          gsap.to(this.header.nativeElement.querySelectorAll('a'), { color: '#000000', duration: 0.3 });
          gsap.to(this.header.nativeElement, { '--before-bg-color': '#000000' });
          gsap.to(this.h1.nativeElement, { color: '#000000', webkitTextFillColor: '#000000', duration: 0.3 });
        },
        onEnterBack: () => {
          // Cambiar a negro suavemente al volver a entrar a la sección de tattoo
          this.transitionThemeColor('#FFFFFF', '#000000', 300);
          // Emitir cambio de tema para otros componentes
          this.emitThemeChange(true);
          // Cambiar color de fondo del cuerpo
          gsap.to('.cuerpo', { backgroundColor: '#000000', duration: 0.3 });
          // Cambiar colores del header
          gsap.to(this.header.nativeElement, { backgroundColor: '#2929296e', duration: 0.3 });
          gsap.to(this.header.nativeElement.querySelectorAll('a'), { color: '#ffffff', duration: 0.3 });
          gsap.to(this.header.nativeElement, { '--before-bg-color': '#ffffff' });
          gsap.to(this.h1.nativeElement, { color: '#FFFFFF', webkitTextFillColor: '#FFFFFF', duration: 0.3 });
        },
        onLeaveBack: () => {
          // Cambiar de vuelta a blanco suavemente al salir hacia arriba de la sección de tattoo
          this.transitionThemeColor('#000000', '#FFFFFF', 300);
          // Emitir cambio de tema para otros componentes
          this.emitThemeChange(false);
          // Restaurar color de fondo del cuerpo
          gsap.to('.cuerpo', { backgroundColor: '#FFFFFF', duration: 0.3 });
          // Restaurar colores del header
          gsap.to(this.header.nativeElement, { backgroundColor: '#ffffff', duration: 0.3 });
          gsap.to(this.header.nativeElement.querySelectorAll('a'), { color: '#000000', duration: 0.3 });
          gsap.to(this.header.nativeElement, { '--before-bg-color': '#000000' });
          gsap.to(this.h1.nativeElement, { color: '#000000', webkitTextFillColor: '#000000', duration: 0.3 });
        }
      }
    });

    // 3. Animación para mostrar el carousel cuando se llega al contenido1
    const carouselElement = this.modelSection.nativeElement.querySelector('.contenido1 .sombra');
    if (carouselElement) {
      // Inicialmente oculto
      gsap.set(carouselElement, { opacity: 0, y: 0, visibility: 'hidden' });
      
      ScrollTrigger.create({
        trigger: this.modelSection.nativeElement.querySelector('.contenido1'),
        scroller: this.cuerpo.nativeElement,
        start: 'top top',
        end: 'bottom bottom',
        onEnter: () => {
          gsap.to(carouselElement, { 
            opacity: 1, 
            y: 0, 
            visibility: 'visible',
            duration: 0.3
          });
        },
        onLeave: () => {
          gsap.to(carouselElement, { 
            opacity: 0, 
            y: 0, 
            duration: 0.6,
            onComplete: () => {
              carouselElement.style.visibility = 'hidden';
            }
          });
        },
        
        onEnterBack: () => {
          gsap.to(carouselElement, { 
            opacity: 1, 
            y: 0, 
            visibility: 'visible',
            duration: 0.3
          });
        },
        onLeaveBack: () => {
          gsap.to(carouselElement, { 
            opacity: 0, 
            y: 0, 
            duration: 0.6,
            onComplete: () => {
              carouselElement.style.visibility = 'hidden';
            }
          });
        }
      });
    }

    // 4. Animación para mostrar el centro2 cuando se llega al contenido2
    const centro2Element = this.modelSection.nativeElement.querySelector('.contenido2 .centro2');
    if (centro2Element) {
      // Inicialmente oculto
      gsap.set(centro2Element, { opacity: 0, y: 0, visibility: 'hidden' });
      
      ScrollTrigger.create({
        trigger: this.modelSection.nativeElement.querySelector('.contenido2'),
        scroller: this.cuerpo.nativeElement,
        start: 'top top',
        end: 'bottom bottom',
        onEnter: () => {
          gsap.to(centro2Element, { 
            opacity: 1, 
            y: 0, 
            visibility: 'visible',
            duration: 0.3
          });
        },
        onLeave: () => {
          gsap.to(centro2Element, { 
            opacity: 0, 
            y: 0, 
            duration: 0.6,
            onComplete: () => {
              centro2Element.style.visibility = 'hidden';
            }
          });
        },
        onEnterBack: () => {
          gsap.to(centro2Element, { 
            opacity: 1, 
            y: 0, 
            visibility: 'visible',
            duration: 0.3
          });
        },
        onLeaveBack: () => {
          gsap.to(centro2Element, { 
            opacity: 0, 
            y: 0, 
            duration: 0.6,
            onComplete: () => {
              centro2Element.style.visibility = 'hidden';
            }
          });
        }
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
    
    // 7. Animación para la imagen del tattoo
    // this.setupTattooImageAnimation(); // Moved to setupScroll()
    
    // 8. Animación para las cartas de la sección2
    this.setupCartasAnimations();
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
        gsap.set(contenedor, { 
          opacity: 0, 
          x: index % 2 === 0 ? -50 : 50 // Alternar dirección según el índice
        });
        
        const textTl = gsap.timeline({
          trigger: contenedor,
          scroller: this.cuerpo.nativeElement,
          start: 'top 75%',
          end: 'bottom 25%',
          toggleActions: 'play reverse play reverse'
        });

        textTl.to(texto, { 
          opacity: 1, 
          x: 0,
          duration: 0.8,
          ease: 'power2.out'
        });
      }
    });

    // Animaciones para los barberos individuales
    this.setupBarberosIndividuales(barberComponent);
  }

  private setupBarberosIndividuales(barberComponent: Element): void {
    // Buscar los barberos individuales
    const yahir = barberComponent.querySelector('.barbero.yahir');
    const leo = barberComponent.querySelector('.barbero.leo');
    const erick = barberComponent.querySelector('.barbero.erick');

    if (!yahir || !leo || !erick) return;

    // Configurar posiciones iniciales
    gsap.set(yahir, { x: -100, opacity: 0 });

    gsap.set(leo, { x: 0, opacity: 0 });

    gsap.set(erick, { x: 100, opacity: 0 });

    // Timeline simple para la animación de entrada
    const barberosTl = gsap.timeline({
      scrollTrigger: {
        trigger: barberComponent.querySelector('.seccion3'),
        scroller: this.cuerpo.nativeElement,
        start: 'top 80%',
        end: 'top 50%',
        scrub: 1
      }
    });

    // Habilitar hover cuando termine la animación
    ScrollTrigger.create({
      trigger: barberComponent.querySelector('.seccion3'),
      scroller: this.cuerpo.nativeElement,
      start: 'top 50%',
      onEnter: () => this.enableBarberHover()
    });

    // Animación simple: todos los barberos se mueven juntos
    barberosTl.to([yahir, leo, erick], { x: 0, opacity: 1, ease: 'none' });

    // Animación del título de la sección (fade-up sencillo al ritmo del scroll)
    const titulo = barberComponent.querySelector('.seccion3 h1') as HTMLElement | null;
    if (titulo) {
      // Estado inicial
      gsap.set(titulo, { opacity: 0, y: 40 });

      // Un único scrub sencillo, sin efectos extra
      gsap.timeline({
        scrollTrigger: {
          trigger: titulo,
          scroller: this.cuerpo.nativeElement,
          start: 'top 95%',
          end: 'top 75%',
          scrub: 1
        }
      }).to(titulo, { opacity: 1, y: 0, ease: 'none' });
    }
  }

  private enableBarberHover(): void {
    // Solo habilitar el hover una vez
    if (document.querySelector('.barbero.hover-enabled')) return;
    
    // Habilitar el hover agregando la clase a todos los barberos
    const barberos = document.querySelectorAll('.barbero');
    barberos.forEach(barbero => {
      barbero.classList.add('hover-enabled');
    });
  }

  // FUNCIÓN DESHABILITADA - El componente tattoo maneja sus propias animaciones
  // private setupTattooImageAnimation(): void {
  //   console.log('🔍 Configurando animación del tattoo...');
  //   // Pequeño delay para asegurar que el componente esté renderizado
  //   setTimeout(() => {
  //     // Buscar el componente tattoo en el DOM
  //     const tattooComponent = document.querySelector('app-tattoo');
  //     console.log('📱 Componente tattoo encontrado:', !!tattooComponent);
  //     if (!tattooComponent) return;

  //     // Buscar la imagen dentro del contenedorImg
  //     const tattooImage = tattooComponent.querySelector('.contenedorImg img');
  //     console.log('🖼️ Imagen del tattoo encontrada:', !!tattooImage);
  //     if (!tattooImage) return;

  //     console.log('✅ Configurando ScrollTrigger para la imagen del tattoo');
  //     // Animación de la imagen basada en scroll - movimiento más sutil
  //     gsap.to(tattooImage, {
  //       y: -150, // Movimiento más sutil para evitar recortes
  //       ease: 'none',
  //       scrollTrigger: {
  //         trigger: tattooComponent,
  //         scroller: this.cuerpo.nativeElement,
  //         start: 'top bottom',
  //         end: 'bottom top',
  //         scrub: 1, // Sincroniza con el scroll
  //       }
  //     });
  //   }, 100); // 100ms de delay
  // }

  private setupScroll(): void {
    this.renderer.addClass(this.cuerpo.nativeElement, 'scroll');
    
    // ACTIVAR LENIS SI NO ESTÁ FUNCIONANDO
    if (this.lenis) {
      if (this.lenis.isLocked || !this.lenis.raf) {
        this.lenis.start();
        console.log('🔓 LENIS ACTIVADO');
      } else {
        console.log('✅ LENIS YA ESTÁ FUNCIONANDO');
      }
    } else {
      console.log('❌ ERROR: LENIS NO ESTÁ INICIALIZADO');
    }
    
    // CONFIGURAR ScrollTriggerProxy para que funcione con Lenis
    this.setupScrollTriggerProxy();
    
    // CONFIGURAR las animaciones esenciales
    this.setupEssentialAnimations();
    
    console.log('🚀 SCROLL CONFIGURADO - LENIS + ANIMACIONES ESENCIALES');
    
    // DEBUG: Verificar estado final
    this.debugScrollState();
  }

  private debugScrollState(): void {
    console.log('🔍 DEBUG ESTADO DEL SCROLL:', {
      cuerpoClass: this.cuerpo.nativeElement.classList.contains('scroll'),
      lenisExists: !!this.lenis,
      lenisLocked: this.lenis?.isLocked,
      lenisRaf: !!this.lenis?.raf,
      scrollTriggerRegistered: !!ScrollTrigger,
      bodyHeight: document.body.scrollHeight,
      cuerpoHeight: this.cuerpo.nativeElement.scrollHeight
    });
  }

  private setupEssentialAnimations(): void {
    console.log('🎬 Configurando animaciones esenciales...');
    
    // 1. ANIMACIÓN DEL TEXTO KIMERA (H1)
    this.h1InitialRect = this.h1.nativeElement.getBoundingClientRect();
    this.h1TargetRect = this.h1Placeholder.nativeElement.getBoundingClientRect();

    if (!this.h1InitialRect || !this.h1TargetRect) {
      console.log('❌ No se pudieron obtener las dimensiones del H1');
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

    // 2. ANIMACIÓN DEL HEADER (cambio de colores)
    ScrollTrigger.create({
      trigger: this.header.nativeElement,
      scroller: this.cuerpo.nativeElement,
      start: 'bottom top',
      onEnter: () => this.transitionThemeColor('#000000', '#FFFFFF', 300),
      onLeaveBack: () => this.transitionThemeColor('#FFFFFF', '#000000', 300)
    });

    console.log('✅ Animaciones esenciales configuradas');
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

  private setupCartasAnimations(): void {
    // Buscar el componente barber en el DOM
    const barberComponent = document.querySelector('app-barber');
    if (!barberComponent) return;

    // Buscar las cartas dentro de la sección2
    const cartas = barberComponent.querySelectorAll('.seccion2 .carta');
    
    cartas.forEach((carta, index) => {
      // Inicialmente ocultas con fade in desde abajo
      gsap.set(carta, { 
        opacity: 1, 
        scale: 1, // Más pequeñas inicialmente
      });
      
      const cartaTl = gsap.timeline({
        scrollTrigger: {
          trigger: carta,
          scroller: this.cuerpo.nativeElement,
          start: 'top 90%', // Empieza más arriba
          end: 'bottom 20%', // Termina más abajo
          scrub: .5, // Sigue el ritmo del scroll
        }
      });

      cartaTl.to(carta, { 
        opacity: 1, 
        scale: 1,
        ease: 'power2.out'
      })
      .to(carta, { 
        opacity: 1, 
        filter: 'blur(10px)',
        scale: 0.6, // Se hace más pequeña al salir
        ease: 'power2.in'
      });
    });

    // Animación para el texto "Comprometidos con tod" - exactamente igual que en images
    const comprometidosTexts = barberComponent.querySelectorAll('.comprometidos .hola');
    if (comprometidosTexts.length > 0) {
      // Timeline para el texto con ScrollTrigger - exactamente igual que en images
      const textTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: barberComponent.querySelector('.comprometidos'),
          scroller: this.cuerpo.nativeElement,
          scrub: 1,
          start: "top 100%",
          end: "bottom 0%",
        }
      });

      // Condicional para desktop vs mobile
      if (window.innerWidth > 1024) {
        // Desktop: y va de 150% a -20%
        textTimeline.fromTo(
          comprometidosTexts,
          { y: '150%' },
          { y: '-10%', duration: 1 }
        )
        .to(comprometidosTexts, { y: '-10%', duration: 1 });
      } else {
        // Mobile/tablet: original valores
        textTimeline.fromTo(
          comprometidosTexts,
          { y: '100%' },
          { y: 0, duration: 1 }
        )
        .to(comprometidosTexts, { y: 0, duration: 1 });
      }
    }
    const desde = barberComponent.querySelector('.desde');

    if(desde) {
      gsap.fromTo(desde,
        { opacity: 0 },
        { opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: desde,
            scroller: this.cuerpo.nativeElement,
            start: "top: 80%",
            end: "bottom 40%",
            toggleActions: "play none none reverse"
          }
         }
      );
    }
    
    const fechaH1 = barberComponent.querySelector('.fecha h1');
    if (fechaH1) {
      gsap.fromTo(fechaH1,
        { x: -500},
        {
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: fechaH1,
            scroller: this.cuerpo.nativeElement,
            start: "top 70%",
            end: "bottom 50%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  }

  // Método para emitir cambios de tema a otros componentes
  private emitThemeChange(isDark: boolean): void {
    // Emitir evento personalizado para que otros componentes puedan escucharlo
    const themeEvent = new CustomEvent('themeChange', {
      detail: { isDark }
    });
    window.dispatchEvent(themeEvent);
  }
}

