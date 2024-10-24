import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';

import { RouterLink, Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/common/servicios/auth.service';
import { ContadorService } from './../../common/servicios/contador.service';
import { PipesModule } from 'src/app/common/servicios/pipe.module';
import { map } from 'rxjs/operators';


import { addIcons } from 'ionicons';
import { star,personCircle, chevronUpCircle, document, colorPalette, globe, homeOutline } from 'ionicons/icons';
import { IonHeader, IonMenuToggle, IonToolbar, IonTitle, IonList, IonContent, IonItem, IonLabel, IonRouterOutlet, IonButtons,IonMenu,IonMenuButton, IonFab, IonFabList, IonIcon, IonFabButton, IonApp, IonBackButton } from "@ionic/angular/standalone";

@Component({
  selector: 'app-base',
  templateUrl: './base.page.html',
  styleUrls: ['./base.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonApp, IonMenuToggle, IonFabButton, IonIcon, IonFabList, IonFab, IonButtons, IonRouterOutlet, IonLabel, IonItem, IonContent, IonList, IonTitle, IonToolbar, IonHeader,IonMenu, IonMenuButton, RouterLink, RouterModule, CommonModule, PipesModule]
})
export class BasePage implements OnInit {

  private _authState = inject(AuthService);
  private _router = inject(Router);
  private _contadorService = inject(ContadorService);
  tiempoRestante$ = this._contadorService.tiempoRestante$.pipe(
    map(tiempoRestante => tiempoRestante !== null ? tiempoRestante : 0) // Proporcionar un valor predeterminado
  );

  pageTitle: string = 'Home';  // Título por defecto
  esPaginaDeInicio: boolean = false;  // Nueva propiedad para detectar si estamos en la página de inicio

  constructor() {


    this._router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateTitle(this._router.url);
        this.esPaginaDeInicio = this._router.url === '/adulto/inicio';
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
    // Quitar prefijos conocidos para simplificar la comparación
    const cleanedUrl = url.replace('/adulto/', '').replace('/nino/', '');

    if (cleanedUrl.includes('inicio')) {
      this.pageTitle = 'Inicio';
    } else if (cleanedUrl.includes('perfil')) {
      this.pageTitle = 'Perfil';
    }  else if (cleanedUrl.includes('recompensas')) {
      this.pageTitle = 'Recompensas';
    } else if (cleanedUrl.includes('trivia')) {
      this.pageTitle = 'Trivia';
    } else if (cleanedUrl.includes('eventos')) {
      this.pageTitle = 'Eventos';
    } else if (cleanedUrl.includes('oirs')) {
      this.pageTitle = 'Historial OIRS';
    } else if (cleanedUrl.includes('mapa')) {
      this.pageTitle = 'Mapa';
    } else if (cleanedUrl.includes('animal-info')) {
      this.pageTitle = 'Atracción';
    } else if (cleanedUrl.includes('informacion')) {
      this.pageTitle = 'Información';
    }else {
      this.pageTitle = 'Menú';  // Título por defecto
    }
  }







}
