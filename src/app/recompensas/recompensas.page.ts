import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import {RecompensasService,Premios} from '../common/servicios/recompensas.service'
import { AuthService } from '../common/servicios/auth.service';
import { Usuario } from '../common/models/usuario.model';

@Component({
  selector: 'app-recompensas',
  templateUrl: './recompensas.page.html',
  styleUrls: ['./recompensas.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonButtons, IonButton, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class RecompensasPage implements OnInit {


  recompensas: Premios[] = [];   // Variable para almacenar los recompensas
  uid: string | null = null;
  usuario: Usuario | null = null;  // Variable para almacenar los datos del usuario
  backButtonHref: string = '/home'; // Ruta por defecto


  constructor(
    private _recompensasService:RecompensasService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
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




}
