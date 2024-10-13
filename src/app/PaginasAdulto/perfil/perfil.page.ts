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
  tipo = "";

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // El ngOnInit se llama solo una vez cuando la página se crea por primera vez.
    this.loadUserData();
    this.tipo = localStorage.getItem('tipo')!;


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


  getAnimalImage(nivel: number | undefined): string {
    if (nivel === undefined) return '';

    if (nivel >= 0 && nivel <= 60) {
      return 'https://cdn0.bioenciclopedia.com/es/posts/7/5/5/raton_557_orig.jpg';
    } else if (nivel >= 61 && nivel <= 100) {
      return 'https://content.nationalgeographic.com.es/medio/2022/12/12/zorro-1_22ba4ddb_221212162236_1280x720.jpg';
    } else if (nivel >= 101 && nivel <= 200) {
      return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZa1DqcZrf_EPniV2Lbvnt7z9iLYyelvkB0A&s';
    } else if (nivel >= 201 && nivel <= 400) {
      return 'https://cdn0.bioenciclopedia.com/es/posts/5/0/8/gorila_de_lomo_plateado_o_espalda_plateada_805_orig.jpg';
    } else {
      return 'https://cdn0.bioenciclopedia.com/es/posts/2/3/0/leon_32_orig.jpg';
    }
  }

  /**
   * Retorna el título correspondiente según el nivel del usuario.
   */
  getAnimalTitle(nivel: number | undefined): string {
    if (nivel === undefined) return '';

    if (nivel >= 0 && nivel <= 60) {
      return 'Diminuto soberano de las sombras';
    } else if (nivel >= 61 && nivel <= 100) {
      return 'Astuto monarca de los bosques';
    } else if (nivel >= 101 && nivel <= 200) {
      return 'Fantasma de las montañas';
    } else if (nivel >= 201 && nivel <= 400) {
      return 'Patriarca de la jungla';
    } else {
      return 'Rey de las sabanas';
    }
  }

}
