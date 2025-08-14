import { Component, AfterViewInit, ElementRef, Input, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-scroll-reverse',
  standalone: true,
  imports: [],
  templateUrl: './scroll-reverse.component.html',
  styleUrl: './scroll-reverse.component.scss'
})
export class ScrollReverseComponent implements AfterViewInit, OnDestroy {
  @Input() scroller: HTMLElement | ElementRef<HTMLElement> | null = null;
  private currentScroller: HTMLElement | Window = window;
  private ctx!: gsap.Context;
  private reverseColumns: HTMLElement[] = [];

  constructor(private el: ElementRef, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    gsap.registerPlugin(ScrollTrigger);

    // Configurar el scroller correcto
    if (this.scroller) {
      this.currentScroller = this.scroller instanceof ElementRef ? 
        this.scroller.nativeElement : 
        this.scroller;
    } else {
      this.currentScroller = window;
    }

    this.ctx = gsap.context(() => {
      try {
        const componentElement = this.el.nativeElement;
        this.reverseColumns = gsap.utils.toArray<HTMLElement>(componentElement.querySelectorAll('.column-reverse'));

        if (this.reverseColumns.length === 0) {
          console.warn('ScrollReverse component: No reverse columns found');
          return;
        }

        // Configurar las columnas reversas con optimizaciones de fluidez
        this.reverseColumns.forEach((column) => {
          // Flip item order in reverse columns
          column.style.flexDirection = "column-reverse";
          // Optimizaciones de fluidez como en el texto kimera
          column.style.willChange = "transform";
          column.style.transformOrigin = "center center";
        });

        // Detectar móvil para ajustar fluidez
        const isMobile = window.innerWidth <= 768;
        
        // Usar timeline igual que el texto kimera para mayor fluidez
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: componentElement,
            scroller: this.currentScroller,
            start: "top bottom",
            end: "bottom top",
            scrub: isMobile ? 1 : true, // Móvil más suave, desktop máxima fluidez
          },
        });

        // Cada columna reversa mantiene el comportamiento de reversa - FLUIDEZ TOTAL
        this.reverseColumns.forEach((column) => {
          tl.fromTo(column, {
            transform: "translateY(-100%)"
          }, {
            transform: "translateY(100%)",
            ease: "none"
          }, 0);
        });

        // Animación para el texto "Gracias por la confianza" - igual que "Comprometidos contigo"
        const textoElement = componentElement.querySelector('.hello__div');
        if (textoElement) {
          const textTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: textoElement,
              scroller: this.currentScroller,
              scrub: 1,
              start: "top 100%",
              end: "bottom 0%",
            }
          });

          const holaTexts = componentElement.querySelectorAll('.hola');
          if (holaTexts.length > 0) {
            // Condicional para desktop vs mobile
            if (window.innerWidth > 1024) {
              // Desktop: y va de 150% a -10%
              textTimeline.fromTo(
                holaTexts,
                { y: '150%' },
                { y: '-10%', duration: 1 }
              )
              .to(holaTexts, { y: '-10%', duration: 1 });
            } else {
              // Mobile/tablet: valores originales
              textTimeline.fromTo(
                holaTexts,
                { y: '100%' },
                { y: 0, duration: 1 }
              )
              .to(holaTexts, { y: 0, duration: 1 });
            }
          }
        }

      } catch (error) {
        console.error('Error initializing ScrollReverse component:', error);
      }
    }, this.el);
  }

  ngOnDestroy() {
    // Limpiar contexto GSAP
    this.ctx?.revert();
  }
}
