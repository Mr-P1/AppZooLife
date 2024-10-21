import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonLoading, IonRow, IonCol, IonPopover, IonButton, IonButtons, IonIcon, IonGrid, IonList, IonLabel, IonItem, IonBackButton } from '@ionic/angular/standalone';
import { FirestoreService } from '../../common/servicios/firestore.service';
import { Animal } from '../../common/models/animal.model';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../common/servicios/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-animal-info',
  templateUrl: './animal-info.page.html',
  styleUrls: ['./animal-info.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonItem, IonLabel, IonList, IonGrid, IonIcon, IonButtons, IonButton, IonPopover, IonCol, IonRow, IonLoading, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonContent]
})
export class AnimalInfoPage implements OnInit {

  animal$: Observable<Animal | null> | undefined;

  // Agrega las nuevas propiedades para el foro
  comments: { user: string, text: string, date: Date }[] = [];
  newComment: string = '';

  constructor(
    private animalService: FirestoreService,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const userId = this.authService.currentUserId;

    if (id) {
      this.animal$ = this.animalService.getAnimal(id);

      if (userId) {
        this.animalService.usuarioHaVistoAnimal(userId, id).subscribe(haVisto => {
          if (!haVisto) {
            setTimeout(() => {
              this.animalService.guardarAnimalVisto(userId, id).subscribe({
                next: () => console.log('Animal visto guardado exitosamente'),
                error: (error) => console.error('Error al guardar el animal visto', error)
              });
            }, 5000);
          }
        });
      }
    }
  }

  // Nuevo método para agregar un comentario
  addComment() {
    if (this.newComment.trim() !== '') {
      const comment = {
        user: 'Usuario Anónimo', // Puedes reemplazar con el nombre del usuario autenticado si lo deseas
        text: this.newComment,
        date: new Date()
      };
      this.comments.push(comment);
      this.newComment = ''; // Limpiar el campo de comentario
    }
  }
}
