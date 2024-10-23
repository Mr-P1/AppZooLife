import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonButtons, IonBackButton, IonSegment, IonSegmentButton, IonLabel, SegmentChangeEventDetail } from '@ionic/angular/standalone';
import {RecompensasService,Premios} from '../common/servicios/recompensas.service'
import { AuthService } from '../common/servicios/auth.service';
import { Usuario } from '../common/models/usuario.model';
import { FirestoreService } from '../common/servicios/firestore.service';
import { forkJoin, of, switchMap } from 'rxjs';
import { Premio, PremioUsuario } from '../common/models/trivia.models';

@Component({
  selector: 'app-recompensas',
  templateUrl: './recompensas.page.html',
  styleUrls: ['./recompensas.page.scss'],
  standalone: true,
  imports: [IonLabel, IonSegmentButton, IonSegment, IonBackButton, IonButtons, IonButton, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class RecompensasPage implements OnInit {


  recompensas: Premios[] = [];   // Variable para almacenar los recompensas
  uid: string | null = null;
  usuario: Usuario | null = null;  // Variable para almacenar los datos del usuario
  backButtonHref: string = '/home'; // Ruta por defecto
  segmentValue: string = 'default';
  premiosDetallados: (PremioUsuario & Premio)[] = [];
  premiosDisponibles: Premio[] =[];
  tipoUsuario!: string|null;
  fondo!:string;


  constructor(
    private _recompensasService:RecompensasService,
    private authService: AuthService,
    private firestoreService: FirestoreService,
  ) { }

  ngOnInit() {
    this.tipoUsuario = localStorage.getItem("tipo");

    // Asignar el fondo según el tipo de usuario
    if (this.tipoUsuario === 'adulto') {
      this.fondo = 'url(./../../assets/fondos/fondo-premios.jpg)';
    } else if (this.tipoUsuario === 'niño') {
      this.fondo = 'url(./../../assets/fondos/fondoNiñoinfoAnimal.png)';
    }

    this._recompensasService.getPremios().subscribe((data)=>{
      this.recompensas = data;
    })

    this.loadUserData(); 

    const tipo = localStorage.getItem("tipo");
    console.log(localStorage.getItem("tipo"))
    if (tipo === 'adulto') {
      this.backButtonHref = '/adulto/inicio';
    } else if (tipo === 'niño') {
      this.backButtonHref = '/nino/inicio';
    }

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

  async loadUserData() {
    try {
      // Obtener el UID del usuario actual
      this.uid = this.authService.currentUserId;
      console.log('UID del usuario actual:', this.uid);

      if (this.uid) {
        this.usuario = await this.authService.getUsuarioFirestore(this.uid);
        console.log('Datos del usuario:', this.usuario);
      } else {
        console.error('No se encontró el UID del usuario');
      }

    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
    }
  }

  onSegmentChange(event: CustomEvent<SegmentChangeEventDetail>) {
    this.segmentValue = String(event.detail.value);
  }


  async canjearPremio(premio: Premios) {
    if (this.usuario && this.usuario.puntos >= premio.puntos_necesarios && premio.cantidad > 0) {
      try {
        // Actualizar la cantidad del premio en el sistema y crear un PremioUsuario
        await this._recompensasService.canjearPremio(premio, this.usuario, this.uid!);

        // Quitar los puntos del usuario en Firebase
        await this._recompensasService.quitarPuntosUsuario(this.uid!, premio.puntos_necesarios);

        // Actualizar los puntos del usuario en la aplicación localmente
        this.usuario.puntos -= premio.puntos_necesarios;

        console.log(`Premio "${premio.nombre}" canjeado con éxito.`);
        alert(`Premio "${premio.nombre}" canjeado con éxito. "${this.usuario.puntos} puntos restantes"`);
      } catch (error) {
        console.error('Error al canjear el premio:', error);
      }
    } else {
      console.error('Puntos insuficientes o premio agotado.');
    }
  }

  mostrarCodigo(premio: PremioUsuario & Premio) {
    alert(`El código asociado al premio es: ${premio.codigo}`);
  }




}
