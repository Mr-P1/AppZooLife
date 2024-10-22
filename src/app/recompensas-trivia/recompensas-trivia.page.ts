import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonItem, SegmentChangeEventDetail } from '@ionic/angular/standalone';
import { AuthService } from '../common/servicios/auth.service';
import { FirestoreService } from '../common/servicios/firestore.service';
import { PremioUsuario, Premio } from '../common/models/trivia.models';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-recompensas-trivia',
  templateUrl: './recompensas-trivia.page.html',
  styleUrls: ['./recompensas-trivia.page.scss'],
  standalone: true,
  imports: [IonItem, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RecompensasTriviaPage implements OnInit {

  premios: PremioUsuario[] = [];
  premiosDetallados: (PremioUsuario & Premio)[] = [];
  uid: string | null = null;
  segmentValue: string = 'default';
  premiosDisponibles: Premio[] =[];

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService,
  ) { }

  ngOnInit() {
    this.authService.authState$.subscribe(user => {
      if (user) {
        this.uid = user.uid;
        console.log("Id del usuario:", this.uid);

        this.firestoreService.obtenerPremiosUsuario(this.uid!).pipe(
          switchMap((premiosUsuario: PremioUsuario[]) => {
            if (premiosUsuario.length === 0) {
              return of([]); // Si no hay premios, retornamos un array vacío.
            }

            const detallesPremios$ = premiosUsuario.map((premioUsuario) =>
              this.firestoreService.obtenerPremioPorId(premioUsuario.premioId).pipe(
                switchMap((detallePremio) => {
                  return of({ ...premioUsuario, ...detallePremio });
                })
              )
            );

            return forkJoin(detallesPremios$);
          })
        ).subscribe((premiosDetallados) => {
          this.premiosDetallados = premiosDetallados;
          console.log(this.premiosDetallados);
        });
      } else {
        console.error('El usuario no está autenticado.');
      }
    });

    this.firestoreService.getPremios().subscribe((data) => {
      this.premiosDisponibles = data;
      console.log('Premios disponibles:', this.premiosDisponibles);
    });
  }

  onSegmentChange(event: CustomEvent<SegmentChangeEventDetail>) {
    this.segmentValue = String(event.detail.value);
  }

  mostrarCodigo(premio: PremioUsuario & Premio) {
    alert(`El código asociado al premio es: ${premio.codigo}`);
  }
}
