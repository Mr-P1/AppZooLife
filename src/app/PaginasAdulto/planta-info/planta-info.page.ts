import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonLoading, IonRow, IonCol, IonPopover, IonButton, IonButtons, IonIcon, IonGrid, IonList, IonLabel, IonItem, IonBackButton, IonAlert } from '@ionic/angular/standalone';
import { FirestoreService } from '../../common/servicios/firestore.service';
import { Planta } from 'src/app/common/models/plantas.model';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../common/servicios/auth.service';

@Component({
  selector: 'app-planta-info',
  templateUrl: './planta-info.page.html',
  styleUrls: ['./planta-info.page.scss'],
  standalone: true,
  imports: [IonAlert, IonBackButton, IonItem, IonLabel, IonList, IonGrid, IonIcon, IonButtons, IonButton, IonPopover, IonCol, IonRow, IonLoading, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonContent]
})
export class PlantaInfoPage implements OnInit {
  private readonly VIEWS_LIMIT = 5; // Límite de vistas de animales antes de notificar
  planta$: Observable<Planta | null> | undefined;
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
      this.planta$ = this.animalService.getPlanta(id);

      // Acceder al área una vez que se obtienen los datos del animal
      this.planta$.subscribe(planta => {
        if (planta && userId) {
          const area = planta.area; // Obtén el área desde el modelo del animal
          // Guardar el animal visto incluyendo el área
          this.animalService.guardarPlantaVista(userId, id, metodoIngreso, area).subscribe({
            next: () => console.log('Planta vista guardada con método de ingreso:', metodoIngreso, 'y área:', area),
            error: (error) => console.error('Error al guardar la planta vista', error)
          });

          // Inicia el temporizador para el conteo de vistas de sesión
          this.viewTimeout = setTimeout(() => {
            this.incrementarYVerificarVistasSesion(id);
          }, 2000); // 20 segundos en milisegundos
        }
      });
    }
  }

  ngOnDestroy() {
    // Limpia el temporizador si el usuario sale de la página antes de los 20 segundos
    if (this.viewTimeout) {
      clearTimeout(this.viewTimeout);
    }
  }

  private incrementarYVerificarVistasSesion(plantaId: string) {
    // Recupera el contador de la sesión actual desde localStorage
    let atraccionesVistasSesion = JSON.parse(localStorage.getItem('atraccionesVistasSesion') || '[]');

    // Recupera o inicializa la variable atraccionesVistasPreguntas
    let atraccionesVistasPreguntas = JSON.parse(localStorage.getItem('atraccionesVistasPreguntas') || '[]');
    const userId = this.authService.currentUserId;

    // Si la planta no ha sido contada en la sesión actual, la agrega
    if (!atraccionesVistasSesion.includes(plantaId)) {
      atraccionesVistasSesion.push(plantaId);
      localStorage.setItem('atraccionesVistasSesion', JSON.stringify(atraccionesVistasSesion));

      // Verifica si el número de plantas vistas en la sesión alcanza el límite para mostrar la alerta
      if (atraccionesVistasSesion.length === this.VIEWS_LIMIT) {
        console.log('Mostrando alerta automáticamente');
        this.alertaVisible = true; // Muestra la alerta
      }

      // Guarda la vista de esta planta en atraccionesVistasPreguntas
      if (userId) {
        atraccionesVistasPreguntas.push({
          id: plantaId,       // ID de la planta vista
          tipo: 'planta',     // Tipo de atracción
          userId: userId      // ID del usuario
        });

        // Guarda los datos en el localStorage
        localStorage.setItem('atraccionesVistasPreguntas', JSON.stringify(atraccionesVistasPreguntas));
      }
    }
  }


  private redirigirATrivia() {
    this.alertaVisible = false; // Cierra la alerta
    this.router.navigate(['/adulto/trivia']); // Redirige a la página de trivia
  }

}
