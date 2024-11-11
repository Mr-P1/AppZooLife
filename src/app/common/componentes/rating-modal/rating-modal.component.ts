import { Component } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingService } from './../../../common/servicios/rating-service.service';

@Component({
  selector: 'app-rating-modal',
  standalone: true,
  templateUrl: './rating-modal.component.html',
  styleUrls: ['./rating-modal.component.scss'],
  imports: [
    IonicModule,      // Importa solo IonicModule para evitar duplicados
    CommonModule,     // Para directivas como *ngIf y *ngFor
    FormsModule       // Para [(ngModel)]
  ]
})
export class RatingModalComponent {
  stars = [1, 2, 3, 4, 5];
  rating = 0;
  comments = '';

  constructor(
    private modalController: ModalController,
    private ratingService: RatingService
  ) {}

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
      this.dismiss(); // Cierra el modal tras enviar
    } catch (error) {
      alert('Error al enviar la calificación. Inténtalo de nuevo.');
    }
  }

  // Cierra el modal
  dismiss() {
    this.modalController.dismiss();
  }
}
