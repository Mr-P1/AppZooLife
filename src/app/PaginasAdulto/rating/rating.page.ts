import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonItem, IonLabel, IonButtons, IonTextarea } from '@ionic/angular/standalone';
import { RatingService } from 'src/app/common/servicios/rating-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.page.html',
  styleUrls: ['./rating.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent,CommonModule, FormsModule, IonTextarea]
})
export class RatingPage implements OnInit {
  stars = [1, 2, 3, 4, 5];
  rating = 0;
  comments = '';

  constructor(
    private ratingService: RatingService,
    private router: Router  // Inyecta el servicio Router
  ) { }

  ngOnInit() {
  }

    // Establece la calificación según la estrella seleccionada
    setRating(star: number) {
      this.rating = star;
    }

    // Envia la calificación y comentarios
    async submitRating() {
      if (this.rating === 0) {
        alert('Por favor selecciona una calificación');
        return;
      }

      try {
        await this.ratingService.addRating(this.rating, this.comments);
        alert('¡Gracias! Tu calificación ha sido enviada.');
        this.router.navigate(['/adulto/inicio']);  // Asegúrate de que esta sea la ruta correcta
        const hoy = new Date().toISOString().split('T')[0]; // Fecha en formato YYYY-MM-DD
        const encuestaRealizada = {
          fecha: hoy,
          realizada: true
        };
        localStorage.setItem('encuestaRealizada', JSON.stringify(encuestaRealizada));  // Guardamos en localStorage
      } catch (error) {
        alert('Error al enviar la calificación. Inténtalo de nuevo.');
      }
    }


}
