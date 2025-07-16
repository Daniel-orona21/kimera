import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, Renderer2, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import Lenis from 'lenis';
import { BarberComponent } from "../barber/barber.component";
import { TattooComponent } from "../tattoo/tattoo.component";
import { ProductosComponent } from "../productos/productos.component";
import { UbicacionComponent } from "../ubicacion/ubicacion.component";
import { ImagesComponent } from "../images/images.component";

@Component({
  selector: 'app-home',
  imports: [CommonModule, BarberComponent, TattooComponent, ProductosComponent, UbicacionComponent, ImagesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  animationState: 'idle' | 'loading' | 'loaded' = 'idle';
  playAnimation = false;

  @HostBinding('class.no-animation')
  get noAnimation(): boolean {
    return !this.playAnimation;
  }

  private lenis: Lenis | null = null;
  private rafHandle: number | null = null;

  @ViewChild('cuerpo') cuerpo!: ElementRef<HTMLDivElement>;
  @ViewChild('header') header!: ElementRef<HTMLElement>;
  @ViewChild('inicio') inicio!: ElementRef<HTMLElement>;
  @ViewChild('h1') h1!: ElementRef<HTMLElement>;
  @ViewChild('h1Placeholder') h1Placeholder!: ElementRef<HTMLElement>;
  @ViewChild('h1Wrapper') h1Wrapper!: ElementRef<HTMLElement>;
  @ViewChild('subtitulo') subtitulo!: ElementRef<HTMLElement>;
  @ViewChild('scrollDownContainer') scrollDownContainer!: ElementRef<HTMLElement>;

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

    if (!this.playAnimation) {
      this.renderer.addClass(this.subtitulo.nativeElement, 'visible');
      this.renderer.addClass(this.scrollDownContainer.nativeElement, 'visible');
      
      document.fonts.ready.then(() => {
        this.setupScroll();
      });
    }
  }

  onAnimationEnd() {
    const subtituloEl = this.subtitulo.nativeElement;
    const scroll = this.scrollDownContainer.nativeElement;

    setTimeout(() => {
      subtituloEl.classList.add('visible');
      setTimeout(() => {
        this.setupScroll();
        scroll.classList.add('visible')
      }, 500);
    }, 1500);
  }

  scrollTo(section: string) {
    this.lenis?.scrollTo(section, {
      offset: 0,
      duration: 1.5,
    });
  }

  private setupScroll(): void {
    this.renderer.addClass(this.cuerpo.nativeElement, 'scroll');
    this.lenis?.start();
    this.prepareScrollAnimation();
    this.lenis?.on('scroll', this.onScroll);
  }

  private prepareScrollAnimation(): void {
    this.h1InitialRect = this.h1.nativeElement.getBoundingClientRect();
    this.h1TargetRect = this.h1Placeholder.nativeElement.getBoundingClientRect();
    this.animationEndScroll = this.inicio.nativeElement.offsetHeight / 2;
    this.renderer.setStyle(this.h1Wrapper.nativeElement, 'height', `${this.h1InitialRect.height}px`);
    this.renderer.addClass(this.h1.nativeElement, 'moving');
    this.renderer.setStyle(this.h1.nativeElement, 'top', `${this.h1InitialRect.top}px`);
    this.renderer.setStyle(this.h1.nativeElement, 'left', `${this.h1InitialRect.left}px`);
  }

  private onScroll = (e: { scroll: number }) => {
    if (!this.h1InitialRect || !this.h1TargetRect) return;

    const scrollY = e.scroll;
    const progress = Math.min(scrollY / this.animationEndScroll, 1);

    this.renderer.setStyle(this.header.nativeElement, 'opacity', progress);
    this.renderer.setStyle(this.subtitulo.nativeElement, 'opacity', 1 - progress);
    this.renderer.setStyle(this.scrollDownContainer.nativeElement, 'opacity', 1 - progress);

    const targetScale = this.h1TargetRect.width / this.h1InitialRect.width;
    const initialCenterX = this.h1InitialRect.left + this.h1InitialRect.width / 2;
    const initialCenterY = this.h1InitialRect.top + this.h1InitialRect.height / 2;
    const targetCenterX = this.h1TargetRect.left + this.h1TargetRect.width / 2;
    const targetCenterY = this.h1TargetRect.top + this.h1TargetRect.height / 2;
    const deltaX = targetCenterX - initialCenterX;
    const deltaY = targetCenterY - initialCenterY;
    const translateX = deltaX * progress;
    const translateY = deltaY * progress;
    const scale = 1 - (1 - targetScale) * progress;

    const transformValue = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    this.renderer.setStyle(this.h1.nativeElement, 'transform', transformValue);
    this.renderer.setStyle(this.h1.nativeElement, 'transform-origin', 'center center');

    if (progress === 1) {
      this.renderer.addClass(this.h1.nativeElement, 'in-header');
    } else {
      this.renderer.removeClass(this.h1.nativeElement, 'in-header');
    }
  }

}
