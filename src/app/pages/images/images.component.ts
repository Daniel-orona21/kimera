import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrl: './images.component.scss',
})
export class ImagesComponent implements AfterViewInit {
  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    try {
      gsap.registerPlugin(ScrollTrigger);

      const componentElement = this.el.nativeElement;
      const imagesContainer = componentElement.querySelector('.images-container');
      const images = gsap.utils.toArray<HTMLElement>(componentElement.querySelectorAll('.images img'));

      if (!imagesContainer || images.length === 0) {
        console.warn('Images component: Required elements not found');
        return;
      }

      const skewSetter = gsap.quickTo(images, "skewY");
      const clamp = gsap.utils.clamp(-20, 20);

      ScrollTrigger.create({
        trigger: imagesContainer,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: self => skewSetter(clamp(self.getVelocity() / -200)),
        onScrubComplete: () => skewSetter(0),
        onLeave: () => skewSetter(0),
        onLeaveBack: () => skewSetter(0)
      });

      images.forEach(img => {
        const speed = parseFloat(img.getAttribute('data-speed') || '1');
        const yPercent = (speed - 1) * 50;

        gsap.fromTo(img, 
          { y: -yPercent + '%' }, 
          {
            y: yPercent + '%',
            ease: 'none',
            scrollTrigger: {
              trigger: img,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });

    } catch (error) {
      console.error('Error initializing Images component:', error);
    }
  }
}
