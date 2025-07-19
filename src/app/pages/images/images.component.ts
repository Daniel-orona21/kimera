import { Component, AfterViewInit, ElementRef, Input, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrl: './images.component.scss',
})
export class ImagesComponent implements AfterViewInit, OnDestroy {
  @Input() scroller: HTMLElement | null = null;
  private images: HTMLElement[] = [];
  private isInView = false;
  private lastScrollY = 0;
  private lastTime = 0;
  private animationFrame: number | null = null;
  private skewSetter: any = null;
  private currentScroller: HTMLElement | Window = window;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    try {
      const componentElement = this.el.nativeElement;
      const imagesContainer = componentElement.querySelector('.images-container');
      this.images = gsap.utils.toArray<HTMLElement>(componentElement.querySelectorAll('.images img'));
      if (this.scroller) {
        this.currentScroller = this.scroller;
      }

      if (!imagesContainer || this.images.length === 0) {
        console.warn('Images component: Required elements not found');
        return;
      }
      this.skewSetter = gsap.quickTo(this.images, "skewY", { duration: 0.1 });
      this.lastTime = performance.now();
      this.currentScroller.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    
      this.checkVisibility();
      setTimeout(() => {
        this.checkVisibility();
      }, 100);

    } catch (error) {
      console.error('Error initializing Images component:', error);
    }
  }

  private handleScroll = () => {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    this.animationFrame = requestAnimationFrame(() => {
      this.updateSkewEffect();
      this.checkVisibility();
    });
  }

  private updateSkewEffect() {
    if (!this.isInView) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime === 0) return;

    // Get current scroll position
    const currentScrollY = this.currentScroller === window ? window.scrollY : (this.currentScroller as HTMLElement).scrollTop;
    const deltaScroll = currentScrollY - this.lastScrollY;
    
    // Calculate velocity (pixels per millisecond)
    const velocity = deltaScroll / deltaTime;
    
    // Apply skew based on velocity - increased sensitivity
    const clamp = gsap.utils.clamp(-25, 25);
    const skewValue = clamp(velocity * -8); // Increased multiplier for more noticeable effect
    
    if (this.skewSetter) {
      this.skewSetter(skewValue);
    }

    // Update last values
    this.lastScrollY = currentScrollY;
    this.lastTime = currentTime;
  }

  private checkVisibility() {
    const containerRect = this.el.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Check if the images section is in view
    const isVisible = containerRect.top < viewportHeight && containerRect.bottom > 0;
    
    if (isVisible && !this.isInView) {
      this.isInView = true;
      this.startSkewEffect();
    } else if (!isVisible && this.isInView) {
      this.isInView = false;
      this.stopSkewEffect();
    }
  }

  private startSkewEffect() {
    // Reset skew when entering
    if (this.skewSetter) {
      this.skewSetter(0);
    }
  }

  private stopSkewEffect() {
    // Reset skew when leaving
    if (this.skewSetter) {
      this.skewSetter(0);
    }
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.currentScroller) {
      this.currentScroller.removeEventListener('scroll', this.handleScroll);
    }
    // Reset any ongoing animations
    gsap.killTweensOf(this.images);
  }
}
