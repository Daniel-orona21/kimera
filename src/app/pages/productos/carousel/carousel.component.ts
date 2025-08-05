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
      imageUrl: 'https://images.unsplash.com/photo-1530651788726-1dbf58eeef1f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=882&q=80',
      title: 'Bunker',
      subtitle: 'Balthazar',
    },
    {
      id: 2,
      imageUrl: 'https://images.unsplash.com/photo-1559386484-97dfc0e15539?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1234&q=80',
      title: 'Words',
      subtitle: 'Moderator',
    },
    {
      id: 3,
      imageUrl: 'https://images.unsplash.com/photo-1533461502717-83546f485d24?ixlib=rb-1.2.1&auto=format&fit=crop&w=900&q=60',
      title: 'Falling',
      subtitle: 'Otzeki',
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
