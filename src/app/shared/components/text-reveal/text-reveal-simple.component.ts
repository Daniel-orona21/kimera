import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-text-reveal-simple',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text-reveal-simple.component.html',
  styleUrl: './text-reveal-simple.component.scss'
})
export class TextRevealSimpleComponent implements AfterViewInit, OnDestroy {
  @Input() text: string = '';
  @ViewChild('container') container!: ElementRef;

  words: string[] = [];
  wordRevealed: boolean[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.words = this.text.split(' ');
    this.wordRevealed = new Array(this.words.length).fill(false);
    
    setTimeout(() => {
      this.setupScrollTrigger();
    }, 100);
  }

  ngOnDestroy() {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }

  private setupScrollTrigger() {
    const container = this.container.nativeElement;
    const scroller = document.querySelector('.cuerpo');
    
    // Buscar el contenedor padre (el contenedor del barber)
    const parentContainer = container.closest('.contenedor');
    
    if (!parentContainer) {
      console.log('No se encontró el contenedor padre');
      return;
    }

    console.log('Configurando scroll trigger para palabras');

    // Crear timeline con scrub para cada palabra
    this.words.forEach((word, index) => {
      const start = index / this.words.length;
      const end = start + (1 / this.words.length);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: parentContainer,
          scroller: scroller,
          start: 'top 80%',
          end: 'top 40%',
          scrub: 1,
        }
      });

      tl.to(this, {
        duration: 1,
        onUpdate: () => {
          const progress = tl.progress();
          if (progress >= start && progress <= end) {
            // Revelar la palabra cuando llega su turno
            this.wordRevealed[index] = true;
          } else if (progress < start) {
            this.wordRevealed[index] = false;
          } else {
            this.wordRevealed[index] = true;
          }
          this.cdr.detectChanges();
        }
      });
    });
  }
} 