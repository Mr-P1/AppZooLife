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
      {
        path: 'historial-oirs',
        loadComponent: () => import('./PaginasAdulto/historial-oirs/historial-oirs.page').then( m => m.HistorialOirsPage)
      },
      {
        path: 'noticias',
        loadComponent: () => import('./PaginasAdulto/noticias/noticias.page').then( m => m.NoticiasPage)
      },
      {
        path: 'recompensas',
        loadComponent: () => import('./recompensas/recompensas.page').then( m => m.RecompensasPage)
      },
      {
        path: 'noticias-info/:id', // Acepta un parámetro dinámico `id`
        loadComponent: () => import('./noticias-info/noticias-info.page').then(m => m.NoticiasInfoPage)
      },
      {
        path: 'eventos-info/:id',
        loadComponent: () => import('./PaginasAdulto/eventos-info/eventos-info.page').then( m => m.EventosInfoPage)
      },
      {
        path: 'animal-info/:id',
        loadComponent: () => import('./PaginasAdulto/animal-info/animal-info.page').then( m => m.AnimalInfoPage)
      },
      {
        path: 'planta-info/:id',
        loadComponent: () => import('./PaginasAdulto/planta-info/planta-info.page').then( m => m.PlantaInfoPage)
      },


    ]
  },
  {
    path: 'chat/:id',
    loadComponent: () => import('./PaginasAdulto/chat/chat.page').then( m => m.ChatPage)
  },
  {
    path: 'oirs',
    loadComponent: () => import('./PaginasAdulto/oirs/oirs.page').then( m => m.OirsFormPage)
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
      {
        path: 'perfil',
        loadComponent: () => import('./PaginasNiño/perfil/perfil.page').then( m => m.PerfilPage)
      },
      {
        path: 'mapa',
        loadComponent: () => import('./PaginasNiño/mapa/mapa.page').then( m => m.MapaPage)
      },
      {
        path: 'trivia-nino',
        loadComponent: () => import('./PaginasNiño/trivia/trivia.page').then( m => m.TriviaPage)
      },
      {
        path: 'recompensas',
        loadComponent: () => import('./recompensas/recompensas.page').then( m => m.RecompensasPage)
      },
      {
        path: 'animal-info-nino/:id',
        loadComponent: () => import('./PaginasNiño/info-animal/info-animal.page').then( m => m.InfoAnimalPage)
      },
      {
        path: 'info-plantas-nino/:id',
        loadComponent: () => import('./PaginasNiño/info-plantas/info-plantas.page').then( m => m.InfoPlantasPage)
      }


    ]
  },






















];
