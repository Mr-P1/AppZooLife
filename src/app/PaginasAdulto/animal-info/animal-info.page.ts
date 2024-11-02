import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonLoading, IonRow, IonCol, IonPopover, IonButton, IonButtons, IonIcon, IonGrid, IonList, IonLabel, IonItem, IonBackButton, IonAlert } from '@ionic/angular/standalone';
import { FirestoreService } from '../../common/servicios/firestore.service';
import { Animal } from '../../common/models/animal.model';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../common/servicios/auth.service';

@Component({
  selector: 'app-animal-info',
  templateUrl: './animal-info.page.html',
  styleUrls: ['./animal-info.page.scss'],
  standalone: true,
  imports: [IonAlert, IonBackButton, IonItem, IonLabel, IonList, IonGrid, IonIcon, IonButtons, IonButton, IonPopover, IonCol, IonRow, IonLoading, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonContent]
})
export class AnimalInfoPage implements OnInit, OnDestroy {
  private readonly VIEWS_LIMIT = 5; // Límite de vistas de animales antes de notificar
  animal$: Observable<Animal | null> | undefined;
  alertaVisible = false;
  alertButtons: any[];
  private viewTimeout: any; // Variable para almacenar el temporizador

  constructor(
    private animalService: FirestoreService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {
    this.alertButtons = [
      {
        text: 'OK',
        handler: () => {
          this.redirigirATrivia();
        }
      }
    ];
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const userId = this.authService.currentUserId;

    if (id) {
      this.animal$ = this.animalService.getAnimal(id);

      if (userId) {
        // Inicia un temporizador de 20 segundos para contar el animal como visto
        this.viewTimeout = setTimeout(() => {
          // Guarda el animal en Firebase solo después de 20 segundos
          this.animalService.usuarioHaVistoAnimal(userId, id).subscribe(haVisto => {
            if (!haVisto) {
              this.animalService.guardarAnimalVisto(userId, id).subscribe({
                next: () => console.log('Animal visto guardado exitosamente después de 20 segundos'),
                error: (error) => console.error('Error al guardar el animal visto', error)
              });
            }
            this.incrementarYVerificarVistasSesion(id); // Llama al contador de vistas de la sesión
          });
        }, 20000); // 20 segundos en milisegundos
      }
    }
  }

  ngOnDestroy() {
    // Limpia el temporizador si el usuario sale de la página antes de los 20 segundos
    if (this.viewTimeout) {
      clearTimeout(this.viewTimeout);
    }
  }

  private incrementarYVerificarVistasSesion(animalId: string) {
    // Recupera el contador de la sesión actual desde localStorage
    let animalesVistosSesion = JSON.parse(localStorage.getItem('animalesVistosSesion') || '[]');

    // Si el animal ya fue contado en esta sesión, no lo cuenta de nuevo
    if (!animalesVistosSesion.includes(animalId)) {
      animalesVistosSesion.push(animalId);
      localStorage.setItem('animalesVistosSesion', JSON.stringify(animalesVistosSesion));

      // Verifica si el número de animales vistos en la sesión alcanza el límite
      if (animalesVistosSesion.length === this.VIEWS_LIMIT) {
        console.log('Mostrando alerta automáticamente');
        this.alertaVisible = true; // Muestra la alerta
      }
    }
  }

  private redirigirATrivia() {
    this.alertaVisible = false; // Cierra la alerta
    this.router.navigate(['/adulto/trivia']); // Redirige a la página de trivia
  }
}
