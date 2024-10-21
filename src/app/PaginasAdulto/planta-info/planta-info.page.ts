import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonLoading, IonRow, IonCol, IonPopover, IonButton, IonButtons, IonIcon, IonGrid, IonList, IonLabel, IonItem, IonBackButton } from '@ionic/angular/standalone';
import { FirestoreService } from '../../common/servicios/firestore.service';
import { Planta } from 'src/app/common/models/plantas.model';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../common/servicios/auth.service';

interface Comment {
  user: string;
  text: string;
  date: Date;
}

@Component({
  selector: 'app-planta-info',
  templateUrl: './planta-info.page.html',
  styleUrls: ['./planta-info.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonItem, IonLabel, IonList, IonGrid, IonIcon, IonButtons, IonButton, IonPopover, IonCol, IonRow, IonLoading, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonContent]
})
export class PlantaInfoPage implements OnInit {
  planta$: Observable<Planta | null> | undefined;
  newComment: string = ''; // Almacena el comentario nuevo
  comments: Comment[] = []; // Almacena la lista de comentarios

  constructor(
    private animalService: FirestoreService,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const userId = this.authService.currentUserId;

    if (id) {
      this.planta$ = this.animalService.getPlanta(id);

      if (userId) {
        this.animalService.usuarioHaVistoPlanta(userId, id).subscribe(haVisto => {
          if (!haVisto) {
            setTimeout(() => {
              this.animalService.guardarPlantaVista(userId, id).subscribe({
                next: () => console.log('Planta vista guardado exitosamente'),
                error: (error) => console.error('Error al guardar la planta vista', error)
              });
            }, 5000);
          }
        });
      }
    }
  }

  // Método para agregar un nuevo comentario
  addComment() {
    if (this.newComment.trim()) {
      const userId = this.authService.currentUserId;
      const comment: Comment = {
        user: userId ? userId : 'Anónimo', // Usa el ID del usuario o 'Anónimo' si no hay usuario autenticado
        text: this.newComment,
        date: new Date()
      };
      this.comments.push(comment); // Agrega el comentario a la lista
      this.newComment = ''; // Limpia el campo de comentario
    }
  }
}
