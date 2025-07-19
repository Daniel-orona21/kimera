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
  private animationStarted = false;
  private currentScroller: HTMLElement | Window = window;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    try {
      const componentElement = this.el.nativeElement;
      const imagesContainer = componentElement.querySelector('.images-container');
      this.images = gsap.utils.toArray<HTMLElement>(componentElement.querySelectorAll('.images img'));

      // Use window as scroller if none provided
      if (this.scroller) {
        this.currentScroller = this.scroller;
      }

      if (!imagesContainer || this.images.length === 0) {
        console.warn('Images component: Required elements not found');
        return;
      }

      // Create skew setter for smooth animations
      this.skewSetter = gsap.quickTo(this.images, "skewY", { duration: 0.1 });
      this.lastTime = performance.now();

      // Listen to scroll events
      this.currentScroller.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
      
      // Initial check for visibility
      this.checkVisibility();

      // Also check visibility after a short delay to ensure it works
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
    
    console.log('Visibility check:', {
      containerTop: containerRect.top,
      containerBottom: containerRect.bottom,
      viewportHeight,
      isVisible,
      isInView: this.isInView,
      animationStarted: this.animationStarted
    });
    
    if (isVisible && !this.isInView) {
      console.log('Component entered view - starting animations');
      this.isInView = true;
      this.startSkewEffect();
      this.startSvgAnimation();
    } else if (!isVisible && this.isInView) {
      console.log('Component left view');
      this.isInView = false;
      this.stopSkewEffect();
      // Reset animation state so it can restart when re-entering
      this.animationStarted = false;
    }
  }

  private startSvgAnimation() {
    console.log('Starting SVG animation');
    const helloDiv = this.el.nativeElement.querySelector('.hello__div');
    console.log('Hello div found:', !!helloDiv);
    
    if (helloDiv) {
      const svg = helloDiv.querySelector('.hello__svg');
      console.log('SVG element found:', !!svg);
      
      if (svg) {
        console.log('SVG properties before animation:', {
          strokeDasharray: svg.style.strokeDasharray,
          strokeDashoffset: svg.style.strokeDashoffset,
          stroke: svg.style.stroke,
          strokeWidth: svg.style.strokeWidth
        });
        
        // Kill any existing animation
        gsap.killTweensOf(svg);
        
        // Use GSAP to animate the SVG stroke
        gsap.set(svg, {
          strokeDasharray: 5800,
          strokeDashoffset: 5800
        });
        
        console.log('SVG properties after GSAP set:', {
          strokeDasharray: svg.style.strokeDasharray,
          strokeDashoffset: svg.style.strokeDashoffset
        });
        
        gsap.to(svg, {
          strokeDashoffset: 0,
          duration: 3,
          ease: "none",
          delay: .5, // 25% delay as in original
          onComplete: () => {
            console.log('SVG animation completed');
          }
        });
        
        console.log('GSAP SVG animation applied');
      } else {
        console.error('SVG element not found');
      }
    } else {
      console.error('Hello div not found');
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
