import { Routes } from '@angular/router';


export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'registrarse',
    loadComponent: () => import('./registrarse/registrarse.page').then( m => m.RegistrarsePage)
  },
  {
    path: 'informacion',
    loadComponent: () => import('./informacion/informacion.page').then( m => m.InformacionPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },



  //Apartado Adulto
  {
    path: 'adulto',
    loadComponent: () => import('./PaginasAdulto/base/base.page').then(m => m.BasePage),
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./PaginasAdulto/inicio/inicio.page').then(m => m.InicioPage)
      },
      {
        path: 'mapa',
        loadComponent: () => import('./PaginasAdulto/mapa/mapa.page').then(m => m.MapaPage)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./PaginasAdulto/perfil/perfil.page').then(m => m.PerfilPage)
      },
      {
        path: 'trivia',
        loadComponent: () => import('./PaginasAdulto/trivia/trivia.page').then(m => m.TriviaPage)
      },
      {
        path: 'eventos',
        loadComponent: () => import('./PaginasAdulto/eventos/eventos.page').then(m => m.EventosPage)
      },

    ]
  },
  {
    path: 'animal-info/:id',
    loadComponent: () => import('./PaginasAdulto/animal-info/animal-info.page').then( m => m.AnimalInfoPage)
  },



  //Apartado niño
  {
    path: 'nino',
    loadComponent: () => import('./PaginasNiño/base/base.page').then(m => m.BasePage),
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./PaginasNiño/inicio/inicio.page').then(m => m.InicioPage)
      },

    ]
  },





];
