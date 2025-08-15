import { Component, OnInit, AfterViewInit, OnDestroy, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ubicacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ubicacion.component.html',
  styleUrl: './ubicacion.component.scss'
})
export class UbicacionComponent implements OnInit, AfterViewInit, OnDestroy {
  @HostBinding('class.dark-theme') isDarkTheme = false;
  
  private themeChangeListener: (event: Event) => void;

  constructor() {
    // Crear el listener para cambios de tema
    this.themeChangeListener = (event: Event) => {
      const customEvent = event as CustomEvent;
      this.isDarkTheme = customEvent.detail.isDark;
      this.updateThemeStyles();
    };
  }

  ngOnInit(): void {
    // Escuchar cambios de tema desde home
    window.addEventListener('themeChange', this.themeChangeListener);
  }

  ngOnDestroy(): void {
    // Limpiar el listener al destruir el componente
    window.removeEventListener('themeChange', this.themeChangeListener);
  }

  ngAfterViewInit(): void {
    // Add animation classes after view is initialized
    this.addAnimationClasses();
  }

  private addAnimationClasses(): void {
    // Add animation classes to elements for GSAP integration
    setTimeout(() => {
      const elements = document.querySelectorAll('.ubicacion-card');
      elements.forEach((element, index) => {
        element.classList.add('fade-in');
        
        // Trigger animation with slight delay for staggered effect
        setTimeout(() => {
          element.classList.add('visible');
        }, index * 200);
      });
    }, 100);
  }

  private updateThemeStyles(): void {
    // Actualizar estilos basados en el tema
    const container = document.querySelector('.ubicacion-container');
    if (container) {
      if (this.isDarkTheme) {
        container.classList.add('dark-theme');
      } else {
        container.classList.remove('dark-theme');
      }
    }
  }

  // Method to open Google Maps in new tab
  openGoogleMaps(address: string): void {
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://maps.google.com/?q=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  }
}
