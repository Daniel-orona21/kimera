import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import Lenis from 'lenis';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  animationState: 'idle' | 'loading' | 'loaded' = 'idle';
  playAnimation = true;
  private lenis: Lenis | null = null;
  private rafHandle: number | null = null;

  @ViewChild('cuerpo') cuerpo!: ElementRef<HTMLDivElement>;
  @ViewChild('header') header!: ElementRef<HTMLElement>;
  @ViewChild('inicio') inicio!: ElementRef<HTMLElement>;
  @ViewChild('h1') h1!: ElementRef<HTMLElement>;
  @ViewChild('h1Placeholder') h1Placeholder!: ElementRef<HTMLElement>;
  @ViewChild('h1Wrapper') h1Wrapper!: ElementRef<HTMLElement>;
  @ViewChild('subtitulo') subtitulo!: ElementRef<HTMLElement>;

  private h1InitialRect?: DOMRect;
  private h1TargetRect?: DOMRect;
  private animationEndScroll = 0;

  private initialTimer: any;
  private loadingTimer: any;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
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
      this.onAnimationEnd();
    }
  }

  ngOnDestroy() {
    clearTimeout(this.initialTimer);
    clearTimeout(this.loadingTimer);
    if (this.rafHandle) {
      cancelAnimationFrame(this.rafHandle);
    }
    this.lenis?.destroy();
    this.lenis?.off('scroll', this.onScroll);
  }

  ngAfterViewInit() {
    this.lenis = new Lenis({
      wrapper: this.cuerpo.nativeElement,
    });

    this.lenis.stop();

    const raf = (time: number) => {
      this.lenis?.raf(time);
      this.rafHandle = requestAnimationFrame(raf);
    };

    this.rafHandle = requestAnimationFrame(raf);
  }

  onAnimationEnd() {
    const subtituloEl = this.subtitulo.nativeElement;

    setTimeout(() => {
      subtituloEl.classList.add('visible');
      setTimeout(() => {
        this.cuerpo.nativeElement.classList.add('scroll');
        this.lenis?.start();
        
        this.prepareScrollAnimation();
        this.lenis?.on('scroll', this.onScroll);

      }, 500);
    }, 1500);
  }

  private prepareScrollAnimation(): void {
    this.h1InitialRect = this.h1.nativeElement.getBoundingClientRect();
    this.h1TargetRect = this.h1Placeholder.nativeElement.getBoundingClientRect();
    this.animationEndScroll = this.inicio.nativeElement.offsetHeight / 2;

    // Reservar el espacio del H1 para evitar el "brinco"
    this.renderer.setStyle(this.h1Wrapper.nativeElement, 'height', `${this.h1InitialRect.height}px`);

    // Coloca el H1 en su posición inicial pero como elemento 'fixed'
    this.renderer.addClass(this.h1.nativeElement, 'moving');
    this.renderer.setStyle(this.h1.nativeElement, 'top', `${this.h1InitialRect.top}px`);
    this.renderer.setStyle(this.h1.nativeElement, 'left', `${this.h1InitialRect.left}px`);
  }

  private onScroll = (e: { scroll: number }) => {
    if (!this.h1InitialRect || !this.h1TargetRect) return;

    const scrollY = e.scroll;
    const progress = Math.min(scrollY / this.animationEndScroll, 1);

    // 1. Animar opacidad del header
    this.renderer.setStyle(this.header.nativeElement, 'opacity', progress);

    // 2. Animar opacidad del subtitulo (fade out)
    this.renderer.setStyle(this.subtitulo.nativeElement, 'opacity', 1 - progress);

    // 3. Animar H1
    const targetScale = this.h1TargetRect.width / this.h1InitialRect.width;

    // Coordenadas del centro del H1 inicial
    const initialCenterX = this.h1InitialRect.left + this.h1InitialRect.width / 2;
    const initialCenterY = this.h1InitialRect.top + this.h1InitialRect.height / 2;

    // Coordenadas del centro del H1 final (placeholder)
    const targetCenterX = this.h1TargetRect.left + this.h1TargetRect.width / 2;
    const targetCenterY = this.h1TargetRect.top + this.h1TargetRect.height / 2;

    // Delta de movimiento para el centro
    const deltaX = targetCenterX - initialCenterX;
    const deltaY = targetCenterY - initialCenterY;
    
    // Interpolar translateX, translateY y scale
    const translateX = deltaX * progress;
    const translateY = deltaY * progress;
    const scale = 1 - (1 - targetScale) * progress;

    const transformValue = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    this.renderer.setStyle(this.h1.nativeElement, 'transform', transformValue);
    this.renderer.setStyle(this.h1.nativeElement, 'transform-origin', 'center center');
  }
}
