import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para *ngIf
import { NoticiasService, Noticia } from '../common/servicios/noticias.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-noticias-info',
  templateUrl: './noticias-info.page.html',
  styleUrls: ['./noticias-info.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButtons, IonBackButton
  ]
})
export class NoticiasInfoPage implements OnInit {

  noticia$: Observable<Noticia | null> | undefined;
  public fechaFormateada: string = '';  // Campo para la fecha formateada
  private noticiasService = inject(NoticiasService);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.noticia$ = this.noticiasService.getNoticia(id);
      this.noticia$.subscribe(noticia => {
        if (noticia) {
          // Comprobar si 'fecha' es un Timestamp y convertirlo
          this.fechaFormateada = this.formatDate(noticia.fecha);
        }
      });
    }
  }

  // Función para formatear la fecha
  formatDate(fecha: string | Timestamp): string {
    if (fecha instanceof Timestamp) {
      const date = fecha.toDate();
      return new Intl.DateTimeFormat('es-ES').format(date); // O usa 'dd/MM/yyyy' si prefieres
    }
    return fecha; // Si ya es un string, lo devolvemos tal cual
  }
}
