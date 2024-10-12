import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFab, IonButton, IonList, IonCard, IonItem, IonLabel, IonCardHeader, IonCardTitle, IonCardSubtitle } from '@ionic/angular/standalone';

import { Router, RouterModule } from '@angular/router';
import {EventoService, evento} from '../../common/servicios/eventos.service'


@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.page.html',
  styleUrls: ['./eventos.page.scss'],
  standalone: true,
  imports: [RouterModule,IonCardSubtitle, IonCardTitle, IonCardHeader, IonLabel, IonItem, IonCard, IonList, IonButton, IonFab, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class EventosPage  implements OnInit{


  eventos: evento[] = [];   // Variable para almacenar los eventos

  constructor(
    private _eventoService:EventoService,
    private router: Router,
  ) { }

  ngOnInit(){
    this._eventoService.getEventos().subscribe((data) => {
      this.eventos = data;
    })
  }

  goToEvento(id:string){
    this.router.navigate(['/eventos-info', id]);
  }




}
