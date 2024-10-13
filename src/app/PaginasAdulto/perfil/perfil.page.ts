import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCardContent, IonCard, IonCardTitle, IonCardHeader, IonAvatar, IonApp, IonBadge, IonItem, IonLabel, IonList, IonGrid, IonIcon, IonCol, IonCardSubtitle, IonRow } from '@ionic/angular/standalone';


import { AuthService } from 'src/app/common/servicios/auth.service';
import { Usuario } from '../../common/models/usuario.model';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonRow, IonCardSubtitle, IonCol, IonIcon, IonGrid, IonList, IonLabel, IonItem, IonBadge, IonApp, IonAvatar, IonCardHeader, IonCardTitle, IonCard, IonCardContent, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PerfilPage implements OnInit {

  usuario: Usuario | null = null;  // Variable para almacenar los datos del usuario
  uid: string | null = null;
  email: string = '';  // Inicialización de email por defecto

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // El ngOnInit se llama solo una vez cuando la página se crea por primera vez.
    this.loadUserData();
  }

  ionViewWillEnter() {
    // ionViewWillEnter se ejecuta cada vez que se navega a esta página
    this.loadUserData();
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

}
