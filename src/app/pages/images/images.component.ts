import { Component, AfterViewInit, ElementRef, Input, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrl: './images.component.scss',
})
export class ImagesComponent implements AfterViewInit, OnDestroy {
  @Input() scroller: HTMLElement | ElementRef<HTMLElement> | null = null;
  private images: HTMLElement[] = [];
  private currentScroller: HTMLElement | Window = window;
  private ctx!: gsap.Context;
  private skewTrigger: ScrollTrigger | null = null;

  constructor(private el: ElementRef, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    gsap.registerPlugin(ScrollTrigger);

    this.ctx = gsap.context(() => {
      try {
        // Configurar el scroller correcto
        if (this.scroller) {
          this.currentScroller = this.scroller instanceof ElementRef ? 
            this.scroller.nativeElement : 
            this.scroller;
        } else {
          this.currentScroller = window;
        }
        
        const componentElement = this.el.nativeElement;
        this.images = gsap.utils.toArray<HTMLElement>(componentElement.querySelectorAll('.images img'));

        if (this.images.length === 0) {
          console.warn('Images component: No images found');
          return;
        }

        // Timeline para el texto con ScrollTrigger
        const textTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: ".images-container",
            scroller: this.currentScroller,
            scrub: 1,
            start: "top 25%",
            end: "bottom 80%",
          }
        });

        textTimeline.fromTo(".hola", 
          { opacity: 0, letterSpacing: "0.2em" }, // inicia separadas
          { opacity: 1, letterSpacing: "0em", duration: 1  }
        )
        .to(".hola", { opacity: 1, duration: 4 }) // Mantiene

        // Skew effect usando SOLO ScrollTrigger - SIN listeners directos
        this.skewTrigger = ScrollTrigger.create({
          trigger: this.el.nativeElement,
          scroller: this.currentScroller,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const velocity = self.getVelocity();
            // Cambia el divisor según si es móvil o no
            const isMobile = window.innerWidth <= 768;
            const divisor = isMobile ? -90 : -150;
            const skew = gsap.utils.clamp(-60, 60, velocity / divisor);
            
            
            
            gsap.to(this.images, {
              skewY: skew,
              duration: 1,
              ease: "power2.out",
              overwrite: "auto"
            });
          },
          onLeave: () => {
            gsap.to(this.images, {
              skewY: 0,
              duration: 1,
              ease: "power2.out"
            });
          },
          onEnterBack: () => {
            gsap.to(this.images, {
              skewY: 0,
              duration: 1,
              ease: "power2.out"
            });
          }
        });

      } catch (error) {
        console.error('Error initializing Images component:', error);
      }
    }, this.el);
  }

  ngOnDestroy() {
    // Limpiar ScrollTrigger específico
    if (this.skewTrigger) {
      this.skewTrigger.kill();
    }
    
    // Limpiar contexto GSAP
    this.ctx?.revert();
    
    // Reset ongoing animations
    gsap.killTweensOf(this.images);
  }
}
