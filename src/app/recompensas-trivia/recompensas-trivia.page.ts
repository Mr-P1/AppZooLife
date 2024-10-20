// import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonItem } from '@ionic/angular/standalone';
// import { AuthService } from '../common/servicios/auth.service';
// import { FirestoreService } from '../common/servicios/firestore.service';
// import { PremioUsuario, Premio } from '../common/models/trivia.models';
// import { forkJoin, of } from 'rxjs';
// import { switchMap } from 'rxjs/operators';

// @Component({
//   selector: 'app-recompensas-trivia',
//   templateUrl: './recompensas-trivia.page.html',
//   styleUrls: ['./recompensas-trivia.page.scss'],
//   standalone: true,
//   imports: [IonItem, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
//   schemas: [CUSTOM_ELEMENTS_SCHEMA]
// })
// export class RecompensasTriviaPage implements OnInit {

//   premios: PremioUsuario[] = [];
//   premiosDetallados: (PremioUsuario & Premio)[] = [];

//   constructor(
//     private authService: AuthService,
//     private firestoreService: FirestoreService,
//   ) { }
//   uid: string | null = null;


//   ngOnInit() {
//     this.uid = this.authService.currentUserId;
//     const userId = this.authService.currentUserId;
//     console.log("Id del usuario" , userId)
//     console.log("Id del usuario 2 " , this.uid)

//     if (userId) {
//       this.firestoreService.obtenerPremiosUsuario(userId).pipe(
//         switchMap((premiosUsuario: PremioUsuario[]) => {
//           if (premiosUsuario.length === 0) {
//             return of([]); // Si no hay premios, retornamos un array vacío.
//           }

//           // Creamos un array de observables para obtener los detalles de cada premio.
//           const detallesPremios$ = premiosUsuario.map((premioUsuario) =>
//             this.firestoreService.obtenerPremioPorId(premioUsuario.premioId).pipe(
//               switchMap((detallePremio) => {
//                 return of({ ...premioUsuario, ...detallePremio });
//               })
//             )
//           );

//           // Utilizamos forkJoin para ejecutar todas las solicitudes en paralelo y esperar a que todas terminen.
//           return forkJoin(detallesPremios$);
//         })
//       ).subscribe((premiosDetallados) => {
//         this.premiosDetallados = premiosDetallados;
//         console.log(this.premiosDetallados); // Verificar los datos en la consola
//       });
//     }
//   }



//   mostrarCodigo(premio: PremioUsuario & Premio) {
//     // Muestra el código del premio en un alert o en la consola
//     alert(`El código asociado al premio es: ${premio.codigo}`);
//   }


// }

import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonItem } from '@ionic/angular/standalone';
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

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService,
  ) { }

  ngOnInit() {
    // Nos suscribimos al estado de autenticación para esperar a que el usuario esté disponible
    this.authService.authState$.subscribe(user => {
      if (user) {
        this.uid = user.uid;
        console.log("Id del usuario:", this.uid);

        this.firestoreService.obtenerPremiosUsuario(this.uid!).pipe(
          switchMap((premiosUsuario: PremioUsuario[]) => {
            if (premiosUsuario.length === 0) {
              return of([]); // Si no hay premios, retornamos un array vacío.
            }

            // Creamos un array de observables para obtener los detalles de cada premio.
            const detallesPremios$ = premiosUsuario.map((premioUsuario) =>
              this.firestoreService.obtenerPremioPorId(premioUsuario.premioId).pipe(
                switchMap((detallePremio) => {
                  return of({ ...premioUsuario, ...detallePremio });
                })
              )
            );

            // Utilizamos forkJoin para ejecutar todas las solicitudes en paralelo y esperar a que todas terminen.
            return forkJoin(detallesPremios$);
          })
        ).subscribe((premiosDetallados) => {
          this.premiosDetallados = premiosDetallados;
          console.log(this.premiosDetallados); // Verificar los datos en la consola
        });
      } else {
        console.error('El usuario no está autenticado.');
      }
    });
  }

  mostrarCodigo(premio: PremioUsuario & Premio) {
    // Muestra el código del premio en un alert o en la consola
    alert(`El código asociado al premio es: ${premio.codigo}`);
  }
}
