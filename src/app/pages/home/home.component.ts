import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
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

  private initialTimer: any;
  private loadingTimer: any;

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
    const subtitulo = document.querySelector('.subtitulo') as HTMLElement;

    setTimeout(() => {
      subtitulo.classList.add('visible');
      setTimeout(() => {
        this.cuerpo.nativeElement.classList.add('scroll');
        this.lenis?.start();
        console.log('scrolito started');
      }, 500);
    }, 1500);
  }
}
