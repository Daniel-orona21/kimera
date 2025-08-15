import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


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
}
