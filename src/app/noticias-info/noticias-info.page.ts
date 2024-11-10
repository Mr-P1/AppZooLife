import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/angular/standalone';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para *ngIf
import { NoticiasService, Noticia } from '../common/servicios/noticias.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-noticias-info',
  templateUrl: './noticias-info.page.html',
  styleUrls: ['./noticias-info.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent
  ]
})
export class NoticiasInfoPage implements OnInit {

  noticia$: Observable<Noticia | null> | undefined;
  private noticiasService = inject(NoticiasService);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.noticia$ = this.noticiasService.getNoticia(id);
    }
  }
}
