import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';

import { RouterLink, Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/common/servicios/auth.service';
import { ContadorService } from './../../common/servicios/contador.service';
import { PipesModule } from 'src/app/common/servicios/pipe.module';
import { map } from 'rxjs/operators';
import { IonHeader, IonToolbar, IonTitle, IonList, IonContent, IonItem, IonLabel, IonRouterOutlet, IonButtons,IonMenu,IonMenuButton, IonButton, IonIcon, IonBackButton } from "@ionic/angular/standalone";


import { addIcons } from 'ionicons';
import { star,personCircle, homeOutline } from 'ionicons/icons';
@Component({
  selector: 'app-base-nino',
  templateUrl: './base.page.html',
  styleUrls: ['./base.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonIcon, IonButton, IonButtons, IonRouterOutlet, IonLabel, IonItem, IonContent, IonList, IonTitle, IonToolbar, IonHeader,IonMenu, IonMenuButton, RouterLink, RouterModule, CommonModule, PipesModule]
})
export class BasePage implements OnInit{

  private _authState = inject(AuthService);
  private _router = inject(Router);
  private _contadorService = inject(ContadorService);
  tiempoRestante$ = this._contadorService.tiempoRestante$.pipe(
    map(tiempoRestante => tiempoRestante !== null ? tiempoRestante : 0) // Proporcionar un valor predeterminado
  );

  pageTitle: string = 'Inicio';  // Título por defecto
  esPaginaDeInicio: boolean = false;  // Nueva propiedad para detectar si estamos en la página de inicio

  constructor() {
    addIcons({homeOutline,star,personCircle});

    this._router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateTitle(this._router.url);
        this.esPaginaDeInicio = this._router.url === '/nino/inicio';
      }
    });
  }

  ngOnInit() {
    this._contadorService.iniciarContador();

    this.tiempoRestante$.subscribe((tiempoRestante) => {
      // console.log(`Tiempo restante: ${tiempoRestante}s`);
    });
  }

  async cerrarSesion() {
    await this._authState.logOut();
    this._router.navigate(['']);
  }

  // Método para actualizar el título basado en la URL
  private updateTitle(url: string) {
    if (url.includes('inicio')) {
      this.pageTitle = 'Inicio';
    } else if (url.includes('perfil')) {
      this.pageTitle = 'Perfil';
    } else if (url.includes('recompensas')) {
      this.pageTitle = 'Recompensas';
    } else if (url.includes('trivia')) {
      this.pageTitle = 'Trivia';
    } else if (url.includes('eventos')) {
      this.pageTitle = 'Eventos';
    } else if (url.includes('mapa')) {
      this.pageTitle = 'Mapa';
    } else if (url.includes('mapa')) {
      this.pageTitle = 'Atracción';
    }else if (url.includes('info-plantas')) {
      this.pageTitle = 'Atracción';
    } else if (url.includes('info-zoo')) {
      this.pageTitle = 'Información';
    } else {
      this.pageTitle = 'Menú';  // Título por defecto
    }
  }


}
