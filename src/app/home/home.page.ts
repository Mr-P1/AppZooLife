import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonIcon, IonItem, IonRow,
  IonCol, IonList, IonGrid, IonCardTitle, IonCard, IonSegmentButton, IonLabel, IonSegment, IonCardHeader, IonButtons, IonBackButton, IonSearchbar } from '@ionic/angular/standalone';
import { AuthService } from '../common/servicios/auth.service';
import { Usuario } from '../common/models/usuario.model';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonSearchbar, IonBackButton, IonButtons, IonCardHeader,
    IonSegment, IonLabel, IonSegmentButton, IonCard, IonCardTitle, IonGrid, IonList, RouterModule,
    IonCol, IonRow, IonItem, IonIcon, IonInput, IonButton, IonHeader, IonToolbar, IonTitle, IonContent
  ],
})
export class HomePage implements OnInit {
  uid: string | null = null;
  usuario: Usuario | null = null;
  edad: number | null = null;

  constructor(
    private authService: AuthService,
    private _router: Router,
  ) {}

  async ngOnInit() {
    await this.loadUserData();

    // Hacer un console.log de la edad después de que se carguen los datos
    if (this.edad !== null) {
      console.log(`La edad del usuario es: ${this.edad} años`);
    } else {
      console.log('No se pudo calcular la edad del usuario');
    }

    if (this.edad! < 11){
      localStorage.setItem('tipo','niño')
    }
    else{
      localStorage.setItem('tipo','adulto')
    }

    console.log(localStorage.getItem('tipo'))
  }

  async loadUserData() {
    try {
      // Obtener el UID del usuario actual
      this.uid = this.authService.currentUserId;
      console.log('UID del usuario actual:', this.uid);

      if (this.uid) {
        this.usuario = await this.authService.getUsuarioFirestore(this.uid);


        if (this.usuario && this.usuario.fechaNacimiento) {

          const fechaNacimientoRaw = this.usuario.fechaNacimiento;


          if (fechaNacimientoRaw instanceof Object && 'toDate' in fechaNacimientoRaw) {
            const fechaNacimiento = (fechaNacimientoRaw as any).toDate();
            this.edad = this.calcularEdad(fechaNacimiento);

          } else {
            console.error('La fecha de nacimiento no es un Timestamp válido.');
          }
        } else {
          console.error('No se encontró la fecha de nacimiento del usuario');
        }
      } else {
        console.error('No se encontró el UID del usuario');
      }

    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
    }
  }



  calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();


    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    localStorage.setItem('edad',String(edad))

    return edad;
  }

  reenviar(){
    const tipo = localStorage.getItem('tipo');

    if(tipo == 'adulto'){
      this._router.navigate(['/adulto/inicio']);
    }
    else{
      this._router.navigate(['/nino/inicio']);
    }


  }


}
