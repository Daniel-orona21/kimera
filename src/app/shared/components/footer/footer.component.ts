import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../../config/emailjs.config';


@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  isDarkMode = signal(true);
  email = '';

  ngOnInit() {
    this.updateDarkMode();
  }

  toggleDarkMode() {
    this.isDarkMode.set(!this.isDarkMode());
    this.updateDarkMode();
  }

  private updateDarkMode() {
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  onSubmit() {
    // Handle newsletter subscription
    console.log('Newsletter subscription for:', this.email);
    this.email = '';
  }

  scrollTo(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  trackLinkClick() {
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('event', {
        name: 'instagram_link_click',
        properties: {
          link: 'instagram_profile',
          timestamp: new Date().toISOString()
        }
      });
    }
    this.sendEmailNotification();
    console.log('Instagram link clicked at:', new Date().toISOString());
  }

  private async sendEmailNotification() {
    try {
      const templateParams = {
        to_email: 'danielopez14d@gmail.com',
        to_name: 'Daniel',
        message: `¡Alguien hizo clic en tu enlace de Instagram desde ${window.location.hostname}!`,
        timestamp: new Date().toLocaleString('es-ES'),
        user_agent: navigator.userAgent,
        referrer: document.referrer || 'Directo'
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId, 
        EMAILJS_CONFIG.templateId, 
        templateParams,
        EMAILJS_CONFIG.publicKey
      );

      console.log('Email notification sent successfully:', response);
    } catch (error) {
      console.log('Email notification failed:', error);
    }
  }
}
