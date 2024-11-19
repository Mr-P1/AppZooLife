import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonLoading, IonRow, IonCol, IonPopover, IonButton, IonButtons, IonIcon, IonGrid, IonList, IonLabel, IonItem, IonBackButton } from '@ionic/angular/standalone';
import { FirestoreService } from '../../common/servicios/firestore.service';
import { Animal } from '../../common/models/animal.model';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../common/servicios/auth.service';

@Component({
  selector: 'app-info-animal',
  templateUrl: './info-animal.page.html',
  styleUrls: ['./info-animal.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonItem, IonLabel, IonList, IonGrid, IonIcon, IonButtons, IonButton, IonPopover, IonCol, IonRow, IonLoading, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonContent]
})
export class InfoAnimalPage implements OnInit {
  private readonly VIEWS_LIMIT = 5; // Límite de vistas de animales antes de notificar
  private viewTimeout: any; // Variable para almacenar el temporizador
  animal$: Observable<Animal | null> | undefined;
  alertaVisible = false;
  alertButtons: any[];

  constructor(
    private animalService: FirestoreService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ){
    this.alertButtons = [
      {
        text: 'Ir a trivia',
        handler: () => {
          this.redirigirATrivia();
        }
      },
      {
        text: 'Cerrar',
        handler: () => {
          this.alertaVisible = false; // Cierra la alerta
        }
      }
    ];
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const metodoIngreso = this.route.snapshot.queryParamMap.get('metodo');
    const userId = this.authService.currentUserId;

    if (id && metodoIngreso) {
      // Suscribirse al observable del animal para obtener sus datos
      this.animal$ = this.animalService.getAnimal(id);

      // Acceder al área una vez que se obtienen los datos del animal
      this.animal$.subscribe(animal => {
        if (animal && userId) {
          const area = animal.area; // Obtén el área desde el modelo del animal
          // Guardar el animal visto incluyendo el área
          this.animalService.guardarAnimalVisto(userId, id, metodoIngreso, area).subscribe({
            next: () => console.log('Animal visto registrado exitosamente.'),
            error: (error) => console.error('Error al registrar el animal visto:', error),
          });

          // Inicia el temporizador para el conteo de vistas de sesión
          this.viewTimeout = setTimeout(() => {
            this.incrementarYVerificarVistasSesion(id);
          }, 2000); // 20 segundos en milisegundos
        }
      });
    }
  }

  private incrementarYVerificarVistasSesion(animalId: string) {
    // Recupera el contador de la sesión actual desde localStorage
    let atraccionesVistasSesion = JSON.parse(localStorage.getItem('atraccionesVistasSesion') || '[]');

    // Si el animal ya fue contado en esta sesión, no lo cuenta de nuevo
    if (!atraccionesVistasSesion.includes(animalId)) {
      atraccionesVistasSesion.push(animalId);
      localStorage.setItem('atraccionesVistasSesion', JSON.stringify(atraccionesVistasSesion));

      // Verifica si el número de animales vistos en la sesión alcanza el límite
      if (atraccionesVistasSesion.length === this.VIEWS_LIMIT) {
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
