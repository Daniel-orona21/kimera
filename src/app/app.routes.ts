import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CarouselComponent } from './pages/productos/carousel/carousel.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'carrusel', component: CarouselComponent },
    { path: '**', redirectTo: '' }
];
