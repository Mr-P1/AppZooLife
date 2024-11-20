import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonItem, IonLabel, IonCardHeader, IonCardTitle, IonCardSubtitle } from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { NoticiasService, Noticia } from '../../common/servicios/noticias.service';

@Component({
  selector: 'app-noticias',
  templateUrl: './noticias.page.html',
  styleUrls: ['./noticias.page.scss'],
  standalone: true,
  imports: [RouterModule, IonCardSubtitle, IonCardTitle, IonCardHeader, IonLabel, IonItem, IonCard, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class NoticiasPage implements OnInit {

  noticias: Noticia[] = []; // Variable para almacenar las noticias

  constructor(
    private _noticiasService: NoticiasService,
    private router: Router,
  ) { }

  ngOnInit() {
    this._noticiasService.getNoticias().subscribe((data) => {
      this.noticias = data;
    });
  }

  goToNoticia(id: string) {
    this.router.navigate(['adulto/noticias-info', id]);
  }
}
