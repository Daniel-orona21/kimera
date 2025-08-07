import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-text-reveal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-reveal-container" #container>
      <div class="text-wrapper">
        <p class="text-content">
          <span 
            *ngFor="let word of words; let i = index" 
            class="word"
            [class.revealed]="wordRevealed[i]"
          >
            <span class="word-placeholder">{{ word }}</span>
            <span class="word-revealed">{{ word }}</span>
          </span>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .text-reveal-container {
      position: relative;
      width: 100%;
    }

    .text-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .text-content {
      display: flex;
      flex-wrap: wrap;
      font-size: 1.5rem;
      font-weight: bold;
      line-height: 1.4;
      text-align: center;
    }

    .word {
      position: relative;
      margin: 0 0.25rem;
      display: inline-block;
    }

    .word-placeholder {
      opacity: 0.2;
      color: #666;
    }

    .word-revealed {
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0;
      color: #000;
      transition: opacity 0.5s ease;
    }

    .word.revealed .word-revealed {
      opacity: 1;
    }

    @media (min-width: 768px) {
      .text-content {
        font-size: 2rem;
      }
    }

    @media (min-width: 1024px) {
      .text-content {
        font-size: 2.5rem;
      }
    }
  `]
})
export class TextRevealComponent implements AfterViewInit, OnDestroy {
  @Input() text: string = '';
  @ViewChild('container') container!: ElementRef;

  words: string[] = [];
  wordRevealed: boolean[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.words = this.text.split(' ');
    this.wordRevealed = new Array(this.words.length).fill(false);
    
    // Esperar un poco para que el DOM esté listo
    setTimeout(() => {
      this.setupScrollTrigger();
    }, 100);
  }

  ngOnDestroy() {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }

  private setupScrollTrigger() {
    const container = this.container.nativeElement;
    const words = container.querySelectorAll('.word');

    if (words.length === 0) {
      console.log('No se encontraron palabras');
      return;
    }

    console.log('Configurando ScrollTrigger para', words.length, 'palabras');

    // Usar el mismo scroller que las otras animaciones
    const scroller = document.querySelector('.cuerpo');

    words.forEach((word: HTMLElement, index: number) => {
      console.log(`Configurando palabra ${index}: ${word.textContent}`);

      ScrollTrigger.create({
        trigger: container,
        scroller: scroller,
        start: 'top 90%',
        end: 'bottom 10%',
        onEnter: () => {
          console.log(`Palabra ${index} entrando`);
          setTimeout(() => {
            this.wordRevealed[index] = true;
            this.cdr.detectChanges();
            console.log(`Palabra ${index} revelada`);
          }, index * 150);
        },
        onLeave: () => {
          console.log(`Palabra ${index} saliendo`);
          this.wordRevealed[index] = false;
          this.cdr.detectChanges();
        },
        onEnterBack: () => {
          console.log(`Palabra ${index} entrando de vuelta`);
          setTimeout(() => {
            this.wordRevealed[index] = true;
            this.cdr.detectChanges();
          }, index * 150);
        },
        onLeaveBack: () => {
          console.log(`Palabra ${index} saliendo hacia arriba`);
          this.wordRevealed[index] = false;
          this.cdr.detectChanges();
        }
      });
    });
  }
} 