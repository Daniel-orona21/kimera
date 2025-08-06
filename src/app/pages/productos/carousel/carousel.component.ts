import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CarouselItem {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent {
  currentIndex = 0;
  
  carouselItems: CarouselItem[] = [
    {
      id: 1,
      imageUrl: 'images/playera4.png',
      title: 'Edición especial',
      subtitle: 'Viste algo único y de calidad',
    },
    {
      id: 2,
      imageUrl: 'images/playera3.png',
      title: 'Keyless heart',
      subtitle: 'Special colaboration',
    },
    {
      id: 3,
      imageUrl: 'images/playera1.png',
      title: 'Kimera Studio',
      subtitle: 'COMPROMETIDOS CONTIGO',
    }
  ];

  setCurrentIndex(index: number): void {
    this.currentIndex = index;
  }

  getTransformClass(index: number): string {
    if (index === this.currentIndex) {
      return 'active';
    } else if (index === this.getPreviousIndex()) {
      return 'previous';
    } else if (index === this.getNextIndex()) {
      return 'next';
    }
    // Default state for cards that are not immediately adjacent
    return '';
  }

  getInfoTransformClass(): string {
    return `transform-${this.currentIndex}`;
  }

  private getPreviousIndex(): number {
    return this.currentIndex === 0 ? this.carouselItems.length - 1 : this.currentIndex - 1;
  }

  private getNextIndex(): number {
    return this.currentIndex === this.carouselItems.length - 1 ? 0 : this.currentIndex + 1;
  }

  // Method to get all classes for debugging
  getAllClasses(index: number): string {
    const baseClass = 'card';
    const transformClass = this.getTransformClass(index);
    return `${baseClass} ${transformClass}`.trim();
  }
}
